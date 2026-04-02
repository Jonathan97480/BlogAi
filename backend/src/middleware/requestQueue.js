/**
 * Middleware de file d'attente pour limiter la concurrence sur les routes lourdes.
 *
 * Usage :
 *   import { createQueue } from '../middleware/requestQueue.js';
 *   const iaQueue = createQueue({ concurrency: 2, maxQueue: 20, timeoutMs: 60000 });
 *   router.post('/enrich', iaQueue, handler);
 *
 * Options :
 *   concurrency  — nombre max de requêtes traitées simultanément (défaut : 2)
 *   maxQueue     — taille max de la file d'attente, 0 = illimité (défaut : 50)
 *   timeoutMs    — délai max d'attente en ms avant rejet 503 (défaut : 30000)
 */
export function createQueue({
    concurrency = 2,
    maxQueue = 50,
    timeoutMs = 30000,
} = {}) {
    let active = 0;
    const queue = [];

    function tryNext() {
        while (active < concurrency && queue.length > 0) {
            const item = queue.shift();
            if (!item.cancelled) {
                active++;
                item.proceed();
                break;
            }
            // item annulé par timeout : on passe au suivant
        }
    }

    function release() {
        active--;
        tryNext();
    }

    return function queueMiddleware(req, res, next) {
        // Slot disponible immédiatement
        if (active < concurrency) {
            active++;
            let released = false;
            const releaseOnce = () => {
                if (!released) { released = true; release(); }
            };
            res.on('finish', releaseOnce);
            res.on('close', releaseOnce);
            return next();
        }

        // File pleine
        if (maxQueue > 0 && queue.length >= maxQueue) {
            return res.status(503).json({
                message: 'Serveur occupé. Veuillez réessayer dans quelques secondes.',
                retryAfter: 5,
            });
        }

        // Mise en file d'attente avec timeout
        const item = { proceed: null, cancelled: false };

        const proceedPromise = new Promise((resolve) => {
            item.proceed = resolve;
        });

        queue.push(item);

        const timeoutId = setTimeout(() => {
            item.cancelled = true;
            if (!res.headersSent) {
                res.status(503).json({
                    message: 'Délai d\'attente dépassé. Réessayez.',
                    retryAfter: 10,
                });
            }
        }, timeoutMs);

        proceedPromise.then(() => {
            clearTimeout(timeoutId);

            // La réponse a déjà été envoyée (timeout entre-temps)
            if (item.cancelled || res.headersSent) {
                release();
                return;
            }

            let released = false;
            const releaseOnce = () => {
                if (!released) { released = true; release(); }
            };
            res.on('finish', releaseOnce);
            res.on('close', releaseOnce);
            next();
        });
    };
}

// Instances pré-configurées prêtes à l'emploi
// IA : 2 appels simultanés max, file de 20, timeout 60s
export const iaQueue = createQueue({
    concurrency: parseInt(process.env.IA_CONCURRENCY || '2', 10),
    maxQueue: parseInt(process.env.IA_QUEUE_MAX || '20', 10),
    timeoutMs: parseInt(process.env.IA_QUEUE_TIMEOUT || '60000', 10),
});

// Upload : 3 uploads simultanés max, file de 10, timeout 30s
export const uploadQueue = createQueue({
    concurrency: parseInt(process.env.UPLOAD_CONCURRENCY || '3', 10),
    maxQueue: parseInt(process.env.UPLOAD_QUEUE_MAX || '10', 10),
    timeoutMs: parseInt(process.env.UPLOAD_QUEUE_TIMEOUT || '30000', 10),
});
