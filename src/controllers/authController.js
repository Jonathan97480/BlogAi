import { getAdminByUsername } from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logError } from '../utils/logger.js';

export async function loginAdmin(req, res) {
    const { username, password } = req.body;
    try {
        const admin = await getAdminByUsername(username);
        if (!admin) return res.status(401).json({ message: 'Identifiants invalides' });
        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) return res.status(401).json({ message: 'Identifiants invalides' });
        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
    } catch (err) {
        logError('authController.js', err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
