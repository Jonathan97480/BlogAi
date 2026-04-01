
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/index.js';
import pool from '../src/models/db.js';

const API_KEY = 'sk-test-allperms';
const headers = { 'x-api-key': API_KEY };

// IDs des ressources créées pendant les tests — nettoyés dans after()
const createdPostIds = [];
const createdIdeaIds = [];
let testCategoryId = null;

describe('API v1', function () {
    this.timeout(10000);

    before(async function () {
        // Récupère un category_id réel pour les tests
        const [rows] = await pool.query('SELECT id FROM categorie LIMIT 1');
        if (rows.length === 0) {
            // Crée une catégorie si la table est vide
            const [result] = await pool.query("INSERT INTO categorie (name) VALUES ('test-cat')");
            testCategoryId = result.insertId;
        } else {
            testCategoryId = rows[0].id;
        }
    });

    after(async function () {
        // Nettoyage des articles créés pendant les tests
        for (const id of createdPostIds) {
            await pool.query('DELETE FROM page_post WHERE post_id = ?', [id]);
            await pool.query('DELETE FROM posts WHERE id = ?', [id]);
        }
        // Nettoyage des idées créées pendant les tests
        for (const id of createdIdeaIds) {
            await pool.query('DELETE FROM idea WHERE id = ?', [id]);
        }
    });

    // ── Middleware auth ─────────────────────────────────────────────────────────

    describe('Middleware clé API', () => {
        it('doit refuser une requête sans clé (401)', async () => {
            const res = await request(app).get('/api/v1/getarticlebyName?name=test');
            expect(res.status).to.equal(401);
        });

        it('doit refuser une clé invalide (403)', async () => {
            const res = await request(app)
                .get('/api/v1/getarticlebyName?name=test')
                .set('x-api-key', 'cle-invalide-xyz');
            expect(res.status).to.equal(403);
        });
    });

    // ── Articles — lecture ──────────────────────────────────────────────────────

    describe('GET /api/v1/getarticlebyName', () => {
        it('retourne un tableau avec une clé valide', async () => {
            const res = await request(app)
                .get('/api/v1/getarticlebyName?name=inexistant-xyz')
                .set(headers);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('retourne 400 si le paramètre name est absent', async () => {
            const res = await request(app)
                .get('/api/v1/getarticlebyName')
                .set(headers);
            expect(res.status).to.equal(400);
        });
    });

    describe('GET /api/v1/pages et /api/v1/categories', () => {
        it('GET /api/v1/pages retourne un tableau', async () => {
            const res = await request(app).get('/api/v1/pages').set(headers);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('GET /api/v1/categories retourne un tableau', async () => {
            const res = await request(app).get('/api/v1/categories').set(headers);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    // ── Articles — écriture ─────────────────────────────────────────────────────

    describe('POST /api/v1/setArticle', () => {
        it('crée un article et retourne son id', async () => {
            const res = await request(app)
                .post('/api/v1/setArticle')
                .set(headers)
                .send({ title: '[test] création', content: 'contenu test', category_id: testCategoryId });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('id');
            createdPostIds.push(res.body.id);
        });

        it('crée un article en brouillon par défaut', async () => {
            const res = await request(app)
                .post('/api/v1/setArticle')
                .set(headers)
                .send({ title: '[test] brouillon', content: 'contenu', category_id: testCategoryId });
            expect(res.status).to.equal(201);
            createdPostIds.push(res.body.id);
            const [rows] = await pool.query('SELECT status FROM posts WHERE id = ?', [res.body.id]);
            expect(rows[0].status).to.equal('brouillon');
        });

        it('crée un article avec status publié', async () => {
            const res = await request(app)
                .post('/api/v1/setArticle')
                .set(headers)
                .send({ title: '[test] publié', content: 'contenu', category_id: testCategoryId, status: 'publié' });
            expect(res.status).to.equal(201);
            createdPostIds.push(res.body.id);
            const [rows] = await pool.query('SELECT status FROM posts WHERE id = ?', [res.body.id]);
            expect(rows[0].status).to.equal('publié');
        });

        it('retourne 400 si les champs obligatoires manquent', async () => {
            const res = await request(app)
                .post('/api/v1/setArticle')
                .set(headers)
                .send({ title: 'sans contenu' });
            expect(res.status).to.equal(400);
        });
    });

    describe('PUT /api/v1/editArticle/:id', () => {
        it('modifie un article existant', async () => {
            // Crée l'article à modifier
            const create = await request(app)
                .post('/api/v1/setArticle')
                .set(headers)
                .send({ title: '[test] à modifier', content: 'original', category_id: testCategoryId });
            const id = create.body.id;
            createdPostIds.push(id);

            const res = await request(app)
                .put(`/api/v1/editArticle/${id}`)
                .set(headers)
                .send({ title: '[test] modifié', content: 'modifié', category_id: testCategoryId, status: 'publié' });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('id');
        });

        it('retourne 400 si les champs obligatoires manquent', async () => {
            const res = await request(app)
                .put('/api/v1/editArticle/999999')
                .set(headers)
                .send({ title: 'sans content' });
            expect(res.status).to.equal(400);
        });
    });

    // ── Idées ───────────────────────────────────────────────────────────────────

    describe('CRUD /api/v1/ideas', () => {
        let createdIdeaId = null;

        it('GET /api/v1/ideas retourne un tableau', async () => {
            const res = await request(app).get('/api/v1/ideas').set(headers);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('POST /api/v1/ideas crée une idée', async () => {
            const res = await request(app)
                .post('/api/v1/ideas')
                .set(headers)
                .send({ title: '[test] idée', category_id: testCategoryId, content: 'contenu idée' });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('id');
            createdIdeaId = res.body.id;
            createdIdeaIds.push(createdIdeaId);
        });

        it('POST /api/v1/ideas retourne 400 si champs obligatoires manquent', async () => {
            const res = await request(app)
                .post('/api/v1/ideas')
                .set(headers)
                .send({ title: 'sans category' });
            expect(res.status).to.equal(400);
        });

        it('GET /api/v1/ideas/:id retourne l\'idée créée', async function () {
            if (!createdIdeaId) return this.skip();
            const res = await request(app)
                .get(`/api/v1/ideas/${createdIdeaId}`)
                .set(headers);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('id', createdIdeaId);
            expect(res.body).to.have.property('title', '[test] idée');
        });

        it('GET /api/v1/ideas/:id retourne 404 pour un id inexistant', async () => {
            const res = await request(app)
                .get('/api/v1/ideas/999999999')
                .set(headers);
            expect(res.status).to.equal(404);
        });

        it('PUT /api/v1/ideas/:id met à jour l\'idée', async function () {
            if (!createdIdeaId) return this.skip();
            const res = await request(app)
                .put(`/api/v1/ideas/${createdIdeaId}`)
                .set(headers)
                .send({ title: '[test] idée modifiée', category_id: testCategoryId, content: 'contenu modifié' });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('id', createdIdeaId);
        });

        it('DELETE /api/v1/ideas/:id supprime l\'idée', async function () {
            if (!createdIdeaId) return this.skip();
            const res = await request(app)
                .delete(`/api/v1/ideas/${createdIdeaId}`)
                .set(headers);
            expect(res.status).to.equal(200);
            // Retirer de la liste de nettoyage puisque déjà supprimée
            const idx = createdIdeaIds.indexOf(createdIdeaId);
            if (idx !== -1) createdIdeaIds.splice(idx, 1);
            createdIdeaId = null;
        });
    });
});
