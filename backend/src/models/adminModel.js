import pool from './db.js';
import { logError } from '../utils/logger.js';

export async function getAdminByUsername(username) {
    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
        return rows[0];
    } catch (err) {
        logError('adminModel.js', err.message);
        throw err;
    }
}
