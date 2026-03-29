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

## Notes de déploiement (Raspberry Pi + reverse proxy)

- Le frontend passe par Vite avec proxy:
  - `/api -> http://localhost:5000`
  - `/img -> http://localhost:5000`
- Les URLs d’images doivent rester **relatives** (`/img/...`) pour éviter le mixed-content.
- TinyMCE est configuré en **local/self-hosted** (pas de dépendance Tiny Cloud).

## Services systemd (exemple)

- `blogai-backend.service` (port 5000)
- `blogai-frontend.service` (port 5173)

## Tests

```bash
cd backend
npm test
```

## Fonctionnalités principales
- Gestion des articles, pages, catégories, médias
- API REST sécurisée par clé API
- Enrichissement IA configurable (OpenRouter, etc.)
- Interface admin React (édition IA, réseaux sociaux, etc.)
- Stockage MySQL

## Configuration IA
- Les paramètres IA sont éditables depuis l’admin (URL, clé, modèle, prompt)
- Fusion dynamique entre fichier et base de données

## Réseaux sociaux
- Les liens sont éditables depuis l’admin et stockés dans la table `socialLink`

## Sécurité
- Authentification admin JWT
- Permissions par clé API

## Protection contre l’indexation des bots (admin)

Le panneau d’administration intègre une balise meta spéciale pour empêcher l’indexation par les moteurs de recherche :

- Dans `frontend/src/pages/AdminDashboard.jsx`, la balise suivante est ajoutée via Helmet :

```jsx
<Helmet>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
```

Cela garantit que les pages d’administration ne seront pas référencées ni suivies par les bots ou moteurs de recherche.

## Auteur
- Projet initial par [VotreNom]
