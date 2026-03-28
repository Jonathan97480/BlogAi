import assert from 'assert';
import pool from '../src/models/db.js';

describe('Connexion à la base de données', () => {
    it('doit se connecter à la base de données', async () => {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        assert.strictEqual(rows[0].solution, 2);
    });
});
