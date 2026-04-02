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

Créer `backend/.env` (ne pas versionner ce fichier) :

```env
# ── Base de données ────────────────────────────────────────────────
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=azerty
DB_NAME=blog_ai_tech

# ── Sécurité ───────────────────────────────────────────────────────
JWT_SECRET=une_chaine_secrete_longue_et_aleatoire

# ── IA ─────────────────────────────────────────────────────────────
IA_API_KEY=change-me

# ── Serveur ────────────────────────────────────────────────────────
PORT=5000
LOG_ERRORS=true
```

### Variables de réglage avancé (optionnelles)

Ces variables ont des valeurs par défaut fonctionnelles. Ne les définir que si vous avez besoin d'ajuster les performances en production.

```env
# Pool de connexions MySQL
# Nombre de connexions simultanées à la BDD (défaut : 10)
DB_CONNECTION_LIMIT=10
# Taille de la file d'attente SQL, 0 = illimitée (défaut : 0)
DB_QUEUE_LIMIT=0

# File d'attente des appels IA (/api/ia/enrich et /api/v1/IaOptimiseText)
# Nombre d'appels IA traités en parallèle (défaut : 2)
IA_CONCURRENCY=2
# Nb max de requêtes en attente avant rejet 503 (défaut : 20)
IA_QUEUE_MAX=20
# Délai max d'attente en ms avant rejet 503 (défaut : 60000 = 60s)
IA_QUEUE_TIMEOUT=60000

# File d'attente des uploads (/api/upload/quill et /api/v1/uploadImage)
# Nombre d'uploads traités en parallèle (défaut : 3)
UPLOAD_CONCURRENCY=3
# Nb max de requêtes en attente avant rejet 503 (défaut : 10)
UPLOAD_QUEUE_MAX=10
# Délai max d'attente en ms avant rejet 503 (défaut : 30000 = 30s)
UPLOAD_QUEUE_TIMEOUT=30000
```

> **En production**, augmenter `DB_CONNECTION_LIMIT` si votre serveur MySQL supporte plus de connexions simultanées. Pour un serveur avec peu de RAM, réduire `IA_CONCURRENCY` à `1` évite que les appels IA ne saturent la mémoire.

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

#### Migration — table des paramètres (settings)

```sql
-- Fichier : database/migrate_settings.sql
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT NOT NULL
);
INSERT INTO settings (`key`, `value`) VALUES ('admin_page_size', '8')
  ON DUPLICATE KEY UPDATE `value` = `value`;
```

Via CLI :
```bash
mysql -u <user> -p <database> < database/migrate_settings.sql
```

Via phpMyAdmin : onglet **SQL**, copier-coller le contenu du fichier.

> **Important :** Sans cette migration, la sauvegarde de la pagination dans le panneau d'administration retournera une erreur 500.

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

# 4. Sur un serveur existant : appliquer les migrations dans l'ordre
mysql -u <user> -p <database> < database/migrate_add_post_status.sql
mysql -u <user> -p <database> < database/migrate_settings.sql
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

### État actuel

L'outil est **fonctionnel et intégré**.

- ✅ Le comparateur existe côté frontend (`/tools/image-compare`)
- ✅ TinyMCE accepte les `iframe`
- ✅ Un helper dans l'éditeur d'article génère le code d'intégration
- ✅ La route `/tools/image-compare` rend le composant en mode embed (early return dans `App.jsx` — aucun header, footer, popup RGPD)
- ✅ Le slider fonctionne correctement grâce à `clip-path` (remplacement du système `div` + calcul de largeur qui cachait l'image gauche)

### Section Outils dans le dashboard admin

Une section **Outils** a été ajoutée dans le panneau d'administration (`/admin-dashboard` → menu "Outils").  
Elle liste tous les outils disponibles avec leur documentation d'utilisation.  
Pour ajouter un nouvel outil, compléter le tableau `TOOLS` dans `frontend/src/pages/ToolsAdmin.jsx`.

## Dashboard admin — Articles

### Filtres et recherche

Dans la vue **Articles** du dashboard, une barre de contrôle est disponible :

- **Champ de recherche** (avec icône loupe) : filtre en temps réel sur le titre et l'extrait
- **Boutons de filtre** : Tous / Publiés / Brouillons — affichent le nombre d'articles correspondants
- Les deux filtres sont combinables (ex. : rechercher "ia" parmi les brouillons)

### Changement de statut rapide

Le badge **Publié** / **Brouillon** sur chaque carte d'article est cliquable :

- Clic → bascule immédiatement le statut (`publié` ↔ `brouillon`) via `PATCH /api/posts/:id/status`
- La liste se recharge automatiquement après le changement
- Sur les cartes Archives, le badge reste non cliquable

Route backend ajoutée : `PATCH /api/posts/:id/status` (JWT requis, body `{ "status": "publié" | "brouillon" }`)

## Infinite scroll (pages publiques)

Les pages publiques suivantes utilisent un système de chargement au défilement :

- `/page/:id` — articles d'une page
- `/category/:category` — articles d'une catégorie
- `/search?q=...` — résultats de recherche

### Fonctionnement

- **4 articles** affichés au chargement initial
- **4 articles supplémentaires** révélés automatiquement dès que l'utilisateur approche le bas de la page (`IntersectionObserver`)
- Quand tous les articles ont été affichés, un message apparaît : *"Vous avez tout vu — N articles au total."*
- La liste se réinitialise automatiquement lors d'un changement de page, catégorie ou recherche

Implémenté via le hook réutilisable `frontend/src/hooks/useInfiniteSlice.js`.

> **Note :** Les routes `/api/pages/:id/posts` et `/api/posts/search` ont été corrigées pour n'exposer que les articles avec `status = 'publié'`.

## Partage social (PostCard + page article)

Les boutons de partage sont présents à deux endroits :

- **Cartes articles** (`PostCard`) — icônes compactes
- **Page article** (`/article/:id`) — boutons avec libellé, en haut ET en bas de l'article

| Réseau | Comportement |
|--------|-------------|
| X (Twitter) | Tweet pré-rempli avec titre, extrait et lien |
| Facebook | Sharer Facebook — aperçu alimenté par les balises Open Graph |
| Reddit | Formulaire Reddit avec titre et lien |
| TikTok | Copie le lien dans le presse-papiers — message `"Copié !"` 2 secondes |

### Balises Open Graph & carte d'identité du site

`index.html` contient des balises OG statiques pour le site entier :

- `og:title`, `og:description`, `og:image` (logo 512px), `og:url`, `og:locale`
- `twitter:card` de type `summary`
- URL de prod : `https://blogaitech.jon-dev.fr/`

La page article (`/article/:id`) les écrase dynamiquement via `react-helmet` :

- `og:type = article`, `og:title`, `og:description` (extrait nettoyé), `og:image` (couverture)
- `twitter:card = summary_large_image`

> **Note :** En développement local Facebook ne peut pas crawler `localhost`. Les aperçus sont visibles uniquement sur le serveur de production (outil de test : [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug)).

## Lecture audio des articles (Text-to-Speech)

Les articles disposent d'un bouton **"Écouter l'article"** qui utilise l'API native **Web Speech (SpeechSynthesis)** — aucune dépendance externe, aucun coût.

### Fonctionnement

- Bouton haut-parleur affiché au-dessus des boutons de partage
- Lit le titre puis le contenu de l'article
- États : **lecture** → **pause** → **reprendre** → **arrêter**
- Progression affichée en temps réel : *"N / total phrases"*
- Voix française (`fr-FR`) sélectionnée automatiquement si disponible sur l'OS
- La lecture s'arrête proprement au changement de page

### Nettoyage du texte avant lecture

Avant envoi au moteur TTS, le contenu est nettoyé :

- Balises `<img>`, `<iframe>`, `<figure>`, `<figcaption>` supprimées entièrement
- Toutes les autres balises HTML retirées
- Entités HTML décodées (`&eacute;` → `é`, `&nbsp;` → espace, etc.)

Implémenté via le hook `frontend/src/hooks/useTextToSpeech.js` et le composant `frontend/src/components/AudioReader.jsx`.

> **Compatibilité :** Chrome, Edge, Safari, Firefox récent. Sur mobile, la lecture doit être déclenchée par un geste utilisateur (le bouton suffit).

## Auteur
- Projet initial par [VotreNom]
