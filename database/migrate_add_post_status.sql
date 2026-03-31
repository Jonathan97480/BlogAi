-- Ajout du champ status à la table posts
ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'brouillon';
