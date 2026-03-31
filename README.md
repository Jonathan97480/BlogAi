# Blog AI Tech

Blog full-stack avec **backend Node/Express + MySQL(MariaDB)** et **frontend React/Vite**.

## Structure

- `backend/` : API REST, auth JWT, upload images, routes admin/public
- `frontend/` : interface publique + dashboard admin

## Prérequis

- Node.js 18+
- npm 9+
- MariaDB/MySQL

## Installation

```bash
git clone https://github.com/Jonathan97480/BlogAi.git
cd BlogAi

cd backend && npm install
cd ../frontend && npm install
```

## Configuration backend

Créer `backend/.env` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=azerty
DB_NAME=blog_ai_tech
JWT_SECRET=une_chaine_secrete
IA_API_KEY=change-me
PORT=5000
LOG_ERRORS=true
```

## Initialiser la base

```bash
cd backend
node src/initDb.js
```

## Lancer en développement

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Points API utiles

- `POST /api/login`
- `GET /api/posts`
- `GET /api/pages`
- `GET /api/posts/search?q=...`
- `GET /api/register-admin/status`

## API externe par clé API (`/api/v1`)

Ces routes utilisent l’en-tête suivant :

```http
x-api-key: <VOTRE_CLE_API>
```

Routes disponibles :

- `GET /api/v1/getarticlebyName?name=...`
- `GET /api/v1/getarticlebyID/:id`
- `POST /api/v1/setArticle`
- `PUT /api/v1/editArticle/:id`
- `GET /api/v1/pages`
- `GET /api/v1/categories`
- `POST /api/v1/IaOptimiseText`
- `POST /api/v1/setAdminUser`
- `GET /api/v1/getAdminUser/:id`
- `POST /api/v1/uploadImage`
- `GET /api/v1/ideas`
- `GET /api/v1/ideas/:id`
- `POST /api/v1/ideas`
- `DELETE /api/v1/ideas/:id`
- `PATCH /api/v1/ideas/:id/processed`

Notes :
- La clé API est générée depuis le panneau d’administration, section paramètres.
- Les permissions sont stockées en base dans la table `apiKey`.
- Le endpoint documenté précédemment sous `/api/ia/posts` n’est pas exposé par le backend actuel.
- `setArticle` et `editArticle` utilisent désormais la structure réelle du projet (`posts`, `categorie`, `page_post`).

### Création d'article via API externe

Route : `POST /api/v1/setArticle`

- Auth : header `x-api-key`
- Permission requise : `write`
- Format : `application/json`
- Champs obligatoires : `title`, `content`, `category_id`
- Champs optionnels : `page_id`, `excerpt`, `image_url`, `image_filename`

Exemple :

```json
{
  "title": "TurboQuant : la technologie de Google qui pourrait enfin rendre l’IA moins gourmande en mémoire",
  "content": "<p>Contenu HTML de l'article</p>",
  "category_id": 1,
  "page_id": 1,
  "excerpt": "Résumé court de l'article",
  "image_url": "/img/api/mon-image.png",
  "image_filename": "mon-image.png"
}
```

Réponse type :

```json
{
  "id": 42,
  "title": "TurboQuant : la technologie de Google qui pourrait enfin rendre l’IA moins gourmande en mémoire",
  "category_id": 1,
  "page_id": 1,
  "media_id": 12
}
```

### Lister les pages disponibles

Route : `GET /api/v1/pages`

Réponse type :

```json
[
  { "id": 1, "name": "IA (Intelligence Artificielle)" },
  { "id": 2, "name": "Actualité" }
]
```

### Lister les catégories disponibles

Route : `GET /api/v1/categories`

Réponse type :

```json
[
  { "id": 1, "name": "Ai" },
  { "id": 2, "name": "News" }
]
```

### Upload d'image via API externe

Route : `POST /api/v1/uploadImage`

- Auth : header `x-api-key`
- Permission requise : `write`
- Format : `multipart/form-data`
- Champ fichier attendu : `image`

Réponse type :

```json
{
  "success": true,
  "media_id": 11,
  "filename": "1774950271483-190082663.png",
  "url": "/img/api/1774950271483-190082663.png"
}
```


## Auteur
- Projet initial par [VotreNom]
