import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../models/db.js';
import { logError } from '../utils/logger.js';

const router = express.Router();

// Vérifie s'il existe déjà un admin
async function adminExists() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin');
    return rows[0].count > 0;
}

// Endpoint non bloquant pour le frontend (évite les 403 visibles côté navigateur)
router.get('/status', async (_req, res) => {
    try {
        res.json({ adminExists: await adminExists() });
    } catch (err) {
        logError('registerAdmin.js', err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Méthode HEAD legacy (conservée pour compatibilité)
router.head('/', async (_req, res) => {
    try {
        if (await adminExists()) {
            return res.sendStatus(403); // Admin existe
        }
        res.sendStatus(200); // Aucun admin
    } catch (err) {
        logError('registerAdmin.js', err.message);
        res.sendStatus(500);
    }
});

router.post('/', async (req, res) => {
    try {
        if (await adminExists()) {
            return res.status(403).json({ message: 'Un administrateur existe déjà.' });
        }
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Champs requis manquants.' });
        }
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [username, hash]);
        res.status(201).json({ message: 'Administrateur créé avec succès.' });
    } catch (err) {
        logError('registerAdmin.js', err.message);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;
