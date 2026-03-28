# Blog AI Tech

## Structure du projet

- **backend/** : Serveur Node.js/Express, API REST, gestion MySQL, authentification JWT, logging avancé.
- **frontend/** : Application React (Vite), thème sombre, composants réutilisables, Tailwind CSS.
- **database/** : Schéma SQL, scripts d'initialisation.

## Installation rapide

1. Cloner le dépôt et installer les dépendances :
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Configurer la base MySQL et le fichier `.env` dans backend (voir `.env.example`).
3. Lancer le backend :
   ```bash
   cd backend && npm run dev
   ```
4. Lancer le frontend :
   ```bash
   cd frontend && npm run dev
   ```

## Tests unitaires backend
```bash
cd backend && npm test
```

## Tests automatisés backend

Pour lancer les tests unitaires sur l’API :

1. Place-toi dans le dossier backend :
   ```bash
   cd backend
   ```
2. Lance les tests avec :
   ```bash
   npm test
   ```
   ou directement :
   ```bash
   npx mocha ./tests/*.mjs
   ```

Les tests utilisent Mocha, Chai et Supertest. Ils vérifient les principaux endpoints, le format des réponses et la sécurité (clé API, erreurs, etc).

**Astuce** : Si tu ajoutes de nouveaux endpoints, crée un fichier .mjs dans backend/tests/ et inspire-toi de api.test.mjs.

## Création d'un administrateur
```bash
cd backend
node createAdmin.js <username> <password>
```

## Commandes utiles
- `npm run dev` : Démarrer le serveur (backend ou frontend)
- `npm test` : Lancer les tests backend

## Sécurité & logs
- Les erreurs sont toujours loggées dans `backend/log/error.log`.
- L'affichage dans le terminal dépend de la variable `LOG_ERRORS` dans `.env`.
- Le fichier `.env` et les dossiers `node_modules` sont ignorés par git.

## Endpoints principaux backend
- `POST /api/login` : Connexion admin (JWT)
- `GET /api/posts` : Liste des articles
- `POST /api/posts` : Création d'article (protégé JWT)

## API principale

### Authentification
- `POST /api/login` : Connexion administrateur (retourne un token JWT)
  
  **Exemple de requête**
  ```json
  {
    "username": "admin",
    "password": "motdepasse"
  }
  ```
  **Réponse**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

### Articles
- `GET /api/posts` : Liste tous les articles non archivés
  
  **Réponse**
  ```json
  [
    {
      "id": 1,
      "title": "L’IA révolutionne la santé",
      "excerpt": "L’intelligence artificielle bouleverse le secteur médical...",
      "media_url": "/img/20260328-131104-admin1.jpg",
      "category": "IA",
      "created_at": "2026-03-28T13:11:04.000Z"
    }
  ]
  ```

- `GET /api/posts/category/:category` : Liste les articles d’une catégorie
- `GET /api/pages/:id/posts` : Liste les articles liés à une page

### Pages
- `GET /api/pages` : Liste toutes les pages
  
  **Réponse**
  ```json
  [
    { "id": 1, "titre": "À propos", "description": "Présentation du blog" }
  ]
  ```
- `GET /api/pages/:id` : Détail d’une page

### Recherche
- `GET /api/posts/search?q=mot` : Recherche d’articles par mot-clé

---

Chaque endpoint retourne une réponse structurée en JSON. Pour les routes protégées (création, édition, suppression), un token JWT est requis dans l’en-tête `Authorization`.

---

## API pour IA (génération automatique d'articles)

### Endpoint sécurisé
- `POST /api/ia/posts` : Permet à une IA ou un service externe de publier un article automatiquement.
- Authentification : clé API à fournir dans l'en-tête `x-api-key` (voir variable `IA_API_KEY` dans le fichier `.env`).

#### Champs attendus (JSON)
- `title` (string, requis) : Titre de l'article
- `excerpt` (string, optionnel) : Résumé/intro
- `content` (string, requis) : Contenu principal (HTML autorisé, voir ci-dessous)
- `category_id` (integer, requis) : ID de la catégorie
- `media_id` (integer, optionnel) : ID d'une image déjà uploadée (voir endpoint /api/media)
- `image_url` (string, optionnel) : URL d'une image externe à intégrer

#### Format du contenu
- Le champ `content` doit être du HTML.
- Balises autorisées : `p`, `h1`, `h2`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `img`, `blockquote`, `code`, `pre`, `br`
- Attributs CSS autorisés : `color`, `font-weight`, `font-style`, `text-align`, `background`, `margin`, `padding`, `border-radius`, `width`, `height`
- Les balises `<script>` et styles globaux sont interdits.
- Les images peuvent être insérées via `<img src="URL">` (URL interne ou externe).

#### Exemple de requête
```json
{
  "title": "L'IA révolutionne la médecine",
  "excerpt": "L'intelligence artificielle bouleverse le secteur médical...",
  "content": "<h2>Une avancée majeure</h2><p>L'IA permet de diagnostiquer plus vite...</p><img src='https://example.com/image.jpg'>",
  "category_id": 2,
  "image_url": "https://example.com/image.jpg"
}
```

#### Upload d'image
- Pour uploader une image, utiliser `POST /api/media` (multipart/form-data, champ `file`).
- Récupérer l'ID retourné et l'utiliser comme `media_id` dans la création d'article.
- Sinon, fournir une URL externe dans `image_url`.

#### Documentation machine-readable
- Voir le fichier `ia-api-doc.json` à la racine du projet pour une description structurée de l'API IA.

---

## Fonctionnalités principales
- Accueil avec les 3 derniers articles et une section de présentation
- Navigation dynamique (pages, catégories)
- Recherche d'articles
- Lecture d'article détaillée
- Cards uniformes avec image et badge catégorie
- Responsive design (header mobile, menu burger)
- Footer compact et RGPD

## Stack technique
- **Frontend** : React (Vite), Tailwind CSS, React Router
- **Backend** : Node.js, Express, MySQL

---

**Note :** L'URL d'administration cachée s'affiche dans les logs au démarrage du backend.

---

## Fichiers ignorés par git
Voir `.gitignore` généré automatiquement.
