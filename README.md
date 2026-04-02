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

## Mise à jour en production

### 1. Installer les nouvelles dépendances

Après chaque `git pull`, toujours relancer les installations :

```bash
cd backend && npm install
cd ../frontend && npm install
```

> La version actuelle ajoute `chai` dans les devDependencies du backend (tests unitaires). Un `npm install` suffit.

### 2. Appliquer les migrations de base de données

Les migrations sontà appliquer **une seule fois** sur chaque environnement.  
Connectez-vous à votre BDD MySQL/MariaDB et exécutez les fichiers manquants dans l'ordre :

#### Migration — ajout du statut d'article

```sql
-- Fichier : database/migrate_add_post_status.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'brouillon';
```

Via CLI :
```bash
mysql -u <user> -p <database> < database/migrate_add_post_status.sql
```

Via phpMyAdmin : onglet **SQL**, copier-coller le contenu du fichier.

> **Important :** Sans cette migration, les routes `PUT /api/posts/:id` et `POST /api/posts` retourneront une erreur 500.

### 3. Ordre complet pour une nouvelle installation

```bash
# 1. Cloner et installer
git clone https://github.com/Jonathan97480/BlogAi.git
cd BlogAi
cd backend && npm install
cd ../frontend && npm install

# 2. Configurer l'environnement
cp backend/.env.example backend/.env  # puis éditer les variables

# 3. Initialiser la base (nouvelle installation uniquement)
cd backend && node src/initDb.js

# 4. Sur un serveur existant : appliquer les migrations
mysql -u <user> -p <database> < database/migrate_add_post_status.sql
```

---

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

- `PUT /api/v1/ideas/:id`
- `GET /api/v1/ideas/`
- `GET /api/v1/ideas/:id`
- `POST /api/v1/ideas`
- `DELETE /api/v1/ideas/:id`
- `PATCH /api/v1/ideas/:id/processed`

Notes :
- La clé API est générée depuis le panneau d'administration, section paramètres.
- Les permissions sont stockées en base dans la table `apiKey`.
- Le endpoint documenté précédemment sous `/api/ia/posts` n'est pas exposé par le backend actuel.
- `setArticle` et `editArticle` utilisent désormais la structure réelle du projet (`posts`, `categorie`, `page_post`).
- Le champ `status` (`'brouillon'` / `'publié'`) est supporté sur `setArticle` et `editArticle`.

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



## Outil de comparaison d'images (iframe)

Un outil frontend de comparaison d'images a été ajouté pour permettre l'intégration d'un comparateur avant/après via `iframe` dans l'éditeur TinyMCE.

Route prévue :

```text
/tools/image-compare
```

Paramètres d'URL pris en charge :

- `left` : URL de l'image de gauche
- `right` : URL de l'image de droite
- `width` : largeur désirée
- `height` : hauteur désirée
- `labelLeft` : libellé image gauche
- `labelRight` : libellé image droite
- `start` : position initiale du curseur

Exemple :

```html
<iframe src="/tools/image-compare?left=/img/api/a.jpg&right=/img/api/b.jpg&width=1200&height=675&labelLeft=OFF&labelRight=ON&start=50" width="1200" height="675" style="width:100%;max-width:1200px;border:0;overflow:hidden;aspect-ratio:1200/675;display:block;margin:0 auto;" loading="lazy" referrerpolicy="same-origin"></iframe>
```

### État actuel / note pour le développeur

L'outil a été créé pour fournir un vrai comparateur draggable réutilisable dans les articles sans devoir générer une image composite statique.

Cependant, au moment de cette note, l'intégration n'est **pas encore considérée comme finalisée** :

- le comparateur existe côté frontend ;
- TinyMCE accepte désormais les `iframe` ;
- un helper a été ajouté dans l'éditeur d'article pour générer le code d'intégration ;
- **mais l'affichage dans un iframe montre encore le header du site dans certains cas**, ce qui ne devrait pas arriver pour un outil embarqué.

Le comportement attendu est :

- aucune barre de navigation ;
- aucun footer ;
- aucun popup RGPD/cookie ;
- uniquement le comparateur dans l'iframe.

Le prochain développeur devra donc vérifier et corriger proprement le mode embed de `/tools/image-compare` (layout global, routing, rendu Vite/dev, ou masquage forcé du chrome de page).

## Auteur
- Projet initial par [VotreNom]
