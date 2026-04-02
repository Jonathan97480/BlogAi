-- Migration : création de la table settings (clé/valeur)
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) NOT NULL PRIMARY KEY,
    `value` TEXT NOT NULL
);

-- Valeur par défaut : 8 éléments par page dans le dashboard admin
INSERT INTO settings (`key`, `value`)
VALUES ('admin_page_size', '8')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
