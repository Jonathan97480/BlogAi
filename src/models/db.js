import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logError } from '../utils/logger.js';
dotenv.config();

let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} catch (err) {
    logError('db.js', err.message);
    throw err;
}

export default pool;
