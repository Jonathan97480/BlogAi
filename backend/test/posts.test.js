import request from 'supertest';
import { expect } from 'chai';
import app from '../src/index.js';

describe('Routes publiques /api/posts', function () {
    this.timeout(10000);

    describe('GET /api/posts', () => {
        it('retourne un tableau d\'articles', async () => {
            const res = await request(app).get('/api/posts');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /api/posts/:id', () => {
        it('retourne null ou un objet pour un id inexistant', async () => {
            const res = await request(app).get('/api/posts/999999999');
            // 404 ou 200 avec null selon l'implémentation
            expect([200, 404]).to.include(res.status);
        });
    });

    describe('GET /api/posts/search', () => {
        it('retourne un tableau vide pour une recherche vide', async () => {
            const res = await request(app).get('/api/posts/search?q=');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
        });

        it('retourne un tableau pour une recherche valide', async () => {
            const res = await request(app).get('/api/posts/search?q=test');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });
});
