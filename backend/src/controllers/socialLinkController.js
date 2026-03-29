
import socialLinkModel from '../models/socialLinkModel.js';

// GET /api/social/links
async function getLinks(req, res) {
    try {
        const links = await socialLinkModel.getSocialLinks();
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// POST /api/social/links
async function setLinks(req, res) {
    try {
        await socialLinkModel.setSocialLinks(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

export default {
    getLinks,
    setLinks
};
