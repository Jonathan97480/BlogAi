import pool from '../src/models/db.js';

after(async () => {
  try {
    await pool.end();
  } catch (err) {
    // ignore errors when closing pool to avoid masking test results
    console.warn('[TEST] MySQL pool close error:', err.message);
  }
});
