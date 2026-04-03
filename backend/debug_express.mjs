import express from 'express';
import http from 'http';

const app = express();
const router = express.Router();

// Simulate the exact same order as posts.js
router.put('/:id', (req, res) => res.json({ route: 'PUT /:id', id: req.params.id }));
router.get('/:id/versions', (req, res) => res.json({ route: 'GET /:id/versions', id: req.params.id }));
router.post('/:id/versions/:versionId/restore', (req, res) => res.json({ route: 'POST /:id/versions/:versionId/restore' }));
router.get('/archives', (req, res) => res.json({ route: 'GET /archives' }));
router.get('/admin/all', (req, res) => res.json({ route: 'GET /admin/all' }));
router.get('/:id', (req, res) => res.json({ route: 'GET /:id', id: req.params.id }));

app.use('/api/posts', router);

const server = http.createServer(app);
server.listen(5001, async () => {
    const test = (path) => new Promise(resolve => {
        http.get(`http://localhost:5001${path}`, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => resolve(`${res.statusCode} ${d}`));
        });
    });
    console.log('GET /api/posts/3/versions ->', await test('/api/posts/3/versions'));
    console.log('GET /api/posts/archives   ->', await test('/api/posts/archives'));
    console.log('GET /api/posts/admin/all  ->', await test('/api/posts/admin/all'));
    server.close(); process.exit(0);
});
