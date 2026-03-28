import 'dotenv/config';
import request from 'supertest';
import app from '../src/index.js';
const IA_API_KEY = process.env.IA_API_KEY || 'ma_cle_api_super_secrete';
import { expect } from 'chai';

describe('API principale', () => {
    it('GET /api/posts doit retourner 200 et un tableau', async () => {
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('GET /api/posts retourne des objets au bon format', async () => {
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
        if (res.body.length > 0) {
            const post = res.body[0];
            expect(post).to.have.property('id');
            expect(post).to.have.property('title');
            expect(post).to.have.property('excerpt');
            expect(post).to.have.property('media_url');
            expect(post).to.have.property('category');
            expect(post).to.have.property('created_at');
        }
    });

    it('GET /api/pages doit retourner 200 et un tableau', async () => {
        const res = await request(app).get('/api/pages');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('GET /api/pages retourne des objets au bon format', async () => {
        const res = await request(app).get('/api/pages');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
        if (res.body.length > 0) {
            const page = res.body[0];
            expect(page).to.have.property('id');
            expect(page).to.have.property('titre');
            expect(page).to.have.property('description');
        }
    });

    it('POST /api/login refuse un mauvais login', async () => {
        const res = await request(app).post('/api/login').send({ username: 'fake', password: 'wrong' });
        expect(res.statusCode).to.equal(401);
    });

    it('POST /api/posts/ia/posts refuse sans clé API', async () => {
        const res = await request(app).post('/api/posts/ia/posts').send({ title: 'Test', content: '...', category_id: 1 });
        expect(res.statusCode).to.equal(401);
    });

    it('POST /api/posts/ia/posts refuse avec mauvais format', async () => {
        const res = await request(app)
            .post('/api/posts/ia/posts')
            .set('x-api-key', IA_API_KEY)
            .send({ title: '', content: '', category_id: null });
        expect(res.statusCode).to.equal(400);
    });

    // Ajoute ici d'autres tests pour chaque endpoint (GET /api/posts/category/:cat, GET /api/pages/:id, etc)
});
