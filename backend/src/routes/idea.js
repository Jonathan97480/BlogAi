import express from 'express';
import {
    getAllIdeas,
    getIdeaById,
    createIdea,
    updateIdea,
    deleteIdea,
    markIdeaProcessed
} from '../models/ideaModel.js';

const router = express.Router();

// GET toutes les idées
router.get('/', async (req, res) => {
    const ideas = await getAllIdeas();
    res.json(ideas);
});

// GET une idée par id
router.get('/:id', async (req, res) => {
    const idea = await getIdeaById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idée non trouvée' });
    res.json(idea);
});

// POST créer une idée
router.post('/', async (req, res) => {
    const { title, category, excerpt, content, media_id } = req.body;
    if (!title || !category || !content) return res.status(400).json({ message: 'Champs obligatoires manquants' });
    const result = await createIdea({ title, category, excerpt, content, media_id });
    res.status(201).json(result);
});

// PUT éditer une idée
router.put('/:id', async (req, res) => {
    const { title, category, excerpt, content, media_id } = req.body;
    await updateIdea(req.params.id, { title, category, excerpt, content, media_id });
    res.json({ message: 'Idée mise à jour' });
});

// DELETE supprimer une idée
router.delete('/:id', async (req, res) => {
    await deleteIdea(req.params.id);
    res.json({ message: 'Idée supprimée' });
});

// PATCH marquer une idée comme traitée
router.patch('/:id/processed', async (req, res) => {
    await markIdeaProcessed(req.params.id);
    res.json({ message: 'Idée marquée comme traitée' });
});

export default router;
