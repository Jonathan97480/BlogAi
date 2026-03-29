import express from 'express';
import socialLinkController from '../controllers/socialLinkController.js';

const router = express.Router();
// GET: récupérer les liens sociaux
router.get('/links', socialLinkController.getLinks);
// POST: mettre à jour les liens sociaux
router.post('/links', socialLinkController.setLinks);

export default router;
