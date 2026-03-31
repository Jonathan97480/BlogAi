-- Migration de la table idea : category (string) -> category_id (clé étrangère)

-- 1. Ajouter la colonne category_id (nullable temporairement)
ALTER TABLE idea ADD COLUMN category_id INT;

-- 2. Mettre à jour category_id à partir du nom de la catégorie existante
UPDATE idea i
JOIN categorie c ON i.category = c.name
SET i.category_id = c.id;

-- 3. Vérifier les lignes non migrées (catégorie inconnue)
SELECT * FROM idea WHERE category_id IS NULL;
-- (Corrigez manuellement si besoin)

-- 4. Rendre category_id NOT NULL
ALTER TABLE idea MODIFY category_id INT NOT NULL;

-- 5. Ajouter la contrainte de clé étrangère
ALTER TABLE idea ADD CONSTRAINT fk_idea_category FOREIGN KEY (category_id) REFERENCES categorie(id) ON DELETE CASCADE;

-- 6. Supprimer l'ancienne colonne category
ALTER TABLE idea DROP COLUMN category;

-- 7. (Optionnel) Vérifier le résultat
DESCRIBE idea;
SELECT * FROM idea LIMIT 10;
