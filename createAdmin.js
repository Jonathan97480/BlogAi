import bcrypt from 'bcryptjs';
import pool from './src/models/db.js';

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.log('Usage : node createAdmin.js <username> <password>');
    process.exit(1);
}

(async () => {
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [username, hash]);
        console.log(`Administrateur créé : ${username}`);
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la création de l\'admin :', err.message);
        process.exit(1);
    }
})();
