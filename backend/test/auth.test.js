import request from 'supertest';
import { expect } from 'chai';
import app from '../src/index.js';

describe('Route auth POST /api/login', function () {
    this.timeout(10000);

    it('retourne 400 ou 401 si le body est vide', async () => {
        const res = await request(app).post('/api/login').send({});
        expect([400, 401]).to.include(res.status);
    });

    it('retourne 401 pour des identifiants incorrects', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'inexistant_xyz', password: 'mauvais_mdp' });
        expect(res.status).to.equal(401);
    });

    it('retourne 401 pour un mot de passe vide', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'admin', password: '' });
        expect([400, 401]).to.include(res.status);
    });
});
