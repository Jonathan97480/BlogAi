import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve('log');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

export function logError(script, error) {
    const now = new Date();
    const timestamp = now.toISOString();
    const logLine = `[${timestamp}] [${script}] ${error}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'error.log'), logLine);
    // Affiche aussi dans le terminal seulement si LOG_ERRORS=true
    if (process.env.LOG_ERRORS === 'true') {
        console.error(logLine);
    }
}
