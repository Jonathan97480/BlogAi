
import mysql from './db.js';

// Récupérer les liens sociaux (on suppose un seul enregistrement)
async function getSocialLinks() {
    const [rows] = await mysql.query('SELECT * FROM socialLink LIMIT 1');
    return rows[0] || {};
}

// Mettre à jour les liens sociaux (remplace tout, ou insère si vide)
async function setSocialLinks(links) {
    // On vérifie s'il existe déjà une ligne
    const [rows] = await mysql.query('SELECT id FROM socialLink LIMIT 1');
    if (rows.length > 0) {
        // Update
        const id = rows[0].id;
        await mysql.query(`UPDATE socialLink SET x_twitter_url=?, facebook_url=?, reddit_url=?, instagram_url=?, discord_url=?, youtube_url=?, tiktok_url=? WHERE id=?`, [
            links.x_twitter_url || null,
            links.facebook_url || null,
            links.reddit_url || null,
            links.instagram_url || null,
            links.discord_url || null,
            links.youtube_url || null,
            links.tiktok_url || null,
            id
        ]);
    } else {
        // Insert
        await mysql.query(`INSERT INTO socialLink (x_twitter_url, facebook_url, reddit_url, instagram_url, discord_url, youtube_url, tiktok_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            links.x_twitter_url || null,
            links.facebook_url || null,
            links.reddit_url || null,
            links.instagram_url || null,
            links.discord_url || null,
            links.youtube_url || null,
            links.tiktok_url || null
        ]);
    }
}

export default {
    getSocialLinks,
    setSocialLinks
};
