-- Migration : table de versioning des articles
-- Chaque fois qu'un article est modifié, l'ancienne version est sauvegardée ici.

CREATE TABLE IF NOT EXISTS post_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_article INT NOT NULL,
    article JSON NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_article) REFERENCES posts(id) ON DELETE CASCADE
);
