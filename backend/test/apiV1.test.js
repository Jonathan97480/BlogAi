
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/index.js';

const API_KEY = 'sk-test-allperms';
const headers = { 'x-api-key': API_KEY };

describe('API v1 (clé API)', () => {
    // Timeout global pour tous les tests de ce bloc
    before(function () {
        this.timeout(10000);
    });
    it('GET /api/v1/getarticlebyName doit refuser sans clé', async () => {
        const res = await request(app)
            .get('/api/v1/getarticlebyName?name=test');
        expect(res.status).to.equal(401);
    });

    it('GET /api/v1/getarticlebyName doit fonctionner avec la clé de test', async () => {
        const res = await request(app)
            .get('/api/v1/getarticlebyName?name=test')
            .set(headers);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('POST /api/v1/setArticle doit créer un article', async () => {
        const res = await request(app)
            .post('/api/v1/setArticle')
            .set(headers)
            .send({ title: 'test', content: 'contenu', category: 'cat' });
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
    });

    it('PUT /api/v1/editArticle doit modifier un article', async () => {
        // Crée d'abord un article
        const res = await request(app)
            .post('/api/v1/setArticle')
            .set(headers)
            .send({ title: 'editme', content: 'c', category: 'cat' });
        const id = res.body.id;
        const res2 = await request(app)
            .put('/api/v1/editArticle/' + id)
            .set(headers)
            .send({ title: 'editme2', content: 'c2', category: 'cat' });
        expect(res2.status).to.equal(200);
        expect(res2.body).to.have.property('id', id);
    });

    it('POST /api/v1/IaOptimiseText doit répondre', async () => {
        const res = await request(app)
            .post('/api/v1/IaOptimiseText')
            .set(headers)
            .send({ text: 'foo' });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('optimised');
    });

    it('POST /api/v1/setAdminUser doit créer un admin', async () => {
        const res = await request(app)
            .post('/api/v1/setAdminUser')
            .set(headers)
            .send({ username: 'adminTest', password_hash: 'hash' });
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
    });

    it('GET /api/v1/getAdminUser/:id doit retourner un admin', async () => {
        // Crée d'abord un admin
        const res = await request(app)
            .post('/api/v1/setAdminUser')
            .set(headers)
            .send({ username: 'adminTest2', password_hash: 'hash2' });
        const id = res.body.id;
        const res2 = await request(app)
            .get('/api/v1/getAdminUser/' + id)
            .set(headers);
        expect(res2.status).to.equal(200);
        expect(res2.body).to.have.property('id', id);
    });
});
