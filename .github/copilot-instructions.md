# Blog AI Tech — Instructions Copilot

Blog full-stack Node/Express + React/Vite avec IA éditoriale intégrée.  
Dépôt : https://github.com/Jonathan97480/BlogAi

## Architecture

| Dossier | Rôle |
|---------|------|
| `backend/src/` | API REST Express 4, entrée via `server.js` → `index.js` |
| `backend/src/controllers/` | Logique métier, un fichier par domaine |
| `backend/src/routes/` | Définition des routes Express, montées dans `index.js` |
| `backend/src/models/` | Accès BDD — toujours via `pool` depuis `db.js` |
| `backend/src/middleware/` | `verifyJWT.js` (auth admin) · `validateApiKey.js` (API v1) |
| `database/` | `schema.sql` (état initial) · `migrate_*.sql` (évolutions) |
| `frontend/src/pages/` | Pages React routées via React Router v6 |
| `frontend/src/components/` | Composants réutilisables |

**Route admin cachée :** `/hidden-admin-gate` — ne jamais l'exposer dans les réponses API.

## Build & Test

```bash
# Backend
cd backend
npm install
node src/initDb.js          # première fois uniquement
npm run dev                  # nodemon src/server.js, port 5000

# Frontend
cd frontend
npm install
npm run dev                  # Vite dev server, proxy /api → localhost:5000

# Tests backend (Mocha)
cd backend
npm test                     # mocha --timeout 10000 ./test/*.js
```

## Conventions critiques

### ESM pur — aucun `require()`
Le backend a `"type": "module"`. Toujours utiliser `import/export` avec l'extension `.js` explicite :
```js
import pool from '../models/db.js';   // ✅
const pool = require('../models/db'); // ❌
```

### Tests = Mocha, pas Jest
`jest` est présent en devDependencies mais **`npm test` exécute Mocha**.  
Écrire les tests en CommonJS-compatible dans `backend/test/*.js`.  
Le fichier `jest.config.js` existe mais ne sert pas aux tests courants.

### BDD — pool uniquement
Ne jamais créer de connexion directe. Importer uniquement `pool` depuis `backend/src/models/db.js` :
```js
const [rows] = await pool.query('SELECT ...', [params]);
```

### Logger
Utiliser `logError()` depuis `utils/logger.js` à la place de `console.error()` :
```js
import { logError } from '../utils/logger.js';
logError('nomFichier.js', err.message);
```

### Migrations BDD
Ne jamais modifier `database/schema.sql` pour une évolution. Créer `database/migrate_<description>.sql`.

## API v1 — Permissions binaires

En-tête requis : `x-api-key: <clé>`.  
Les permissions sont stockées sous forme de chaîne de 4 caractères `'1100'` :

| Index | Permission |
|-------|-----------|
| `[0]` | `read` |
| `[1]` | `write` |
| `[2]` | `ia` |
| `[3]` | `admin` |

Utiliser `decodePermissions()` depuis `backend/src/middleware/validateApiKey.js`.  
Clé de test `sk-test-allperms` : fonctionnelle uniquement en localhost.

## Frontend

- **React Router v6** : routes déclarées dans `frontend/src/App.jsx`
- **Vite** proxy `/api` et `/img` vers `http://localhost:5000` (dev uniquement)
- **TailwindCSS** : classes utilitaires, config dans `frontend/tailwind.config.js`
- **TinyMCE** : éditeur riche intégré via `@tinymce/tinymce-react`

## Environnement

Créer `backend/.env` (non versionné) — voir [README.md](../README.md#configuration-backend) pour les variables requises.  
Variables clés : `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `IA_API_KEY`, `PORT`.
