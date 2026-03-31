-- Table idea (Idée d'article)
CREATE TABLE IF NOT EXISTS idea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    media_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_processed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES categorie(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
);

-- Table admin
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Table page
CREATE TABLE IF NOT EXISTS page (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table categorie
CREATE TABLE IF NOT EXISTS categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table media
CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL
);

-- Table posts
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    media_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'brouillon',
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
);

-- Table archives
CREATE TABLE IF NOT EXISTS archives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table de liaison page_post
CREATE TABLE IF NOT EXISTS page_post (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (page_id) REFERENCES page(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_page_post (page_id, post_id)
);

-- Table ApiIAText
CREATE TABLE IF NOT EXISTS ApiIAText (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_ia VARCHAR(255) NOT NULL,
    key_ia VARCHAR(255) NOT NULL,
    id_IA VARCHAR(100),
    pront_ia TEXT
);

-- Table socialLink
CREATE TABLE IF NOT EXISTS socialLink (
    id INT AUTO_INCREMENT PRIMARY KEY,
    x_twitter_url VARCHAR(255) DEFAULT NULL,
    facebook_url VARCHAR(255) DEFAULT NULL,
    reddit_url VARCHAR(255) DEFAULT NULL,
    instagram_url VARCHAR(255) DEFAULT NULL,
    discord_url VARCHAR(255) DEFAULT NULL,
    youtube_url VARCHAR(255) DEFAULT NULL,
    tiktok_url VARCHAR(255) DEFAULT NULL
);

-- Table apiKey
CREATE TABLE IF NOT EXISTS apiKey (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    permissions VARCHAR(8) NOT NULL
);
