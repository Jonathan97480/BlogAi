-- Création de l'utilisateur admin par défaut (mot de passe : azerty)
INSERT INTO admin (username, password_hash)
VALUES ('admin', '$2a$10$wQwQwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw');
-- Remplacez le hash par un hash bcrypt réel pour 'azerty'.
