# Backend Blog AI Tech

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer la base de données MySQL et le fichier `.env` (voir `.env.example`).

3. Lancer le serveur :
   ```bash
   npm run dev
   ```

## Tests unitaires

Pour lancer les tests unitaires :
```bash
npm test
```

Les tests couvrent : connexion BDD, hashage mot de passe, auth JWT, routes publiques posts, API v1 complète (articles + idées).

> `chai` est requis comme devDependency — s'installe automatiquement avec `npm install`.

## Création d'un administrateur

Pour créer un administrateur via la CLI :
```bash
node createAdmin.js <username> <password>
```
Exemple :
```bash
node createAdmin.js admin azerty
```

## Endpoints principaux
- `POST /api/login` : Connexion admin (JWT)
- `GET /api/posts` : Liste des articles
- `POST /api/posts` : Création d'article (protégé JWT)

### Endpoints API v1 (clé API requise via `x-api-key`)

| Méthode | URL | Description | Permission(s) requise(s) |
| --- | --- | --- | --- |
| `GET` | `/api/v1/getarticlebyName?name=...` | Récupérer un article par nom | `read` |
| `GET` | `/api/v1/getarticlebyID/:id` | Récupérer un article par ID | `read` |
| `POST` | `/api/v1/setArticle` | Créer un article (`title`, `content`, `category_id` requis) | `write` |
| `PUT` | `/api/v1/editArticle/:id` | Mettre à jour un article | `write` |
| `GET` | `/api/v1/pages` | Lister les pages | `read` |
| `GET` | `/api/v1/categories` | Lister les catégories | `read` |
| `GET` | `/api/v1/ideas` | Récupérer toutes les idées | `read` |
| `GET` | `/api/v1/ideas/:id` | Récupérer une idée précise | `read` |
| `POST` | `/api/v1/ideas` | Créer une nouvelle idée (`title`, `category_id`, `content` requis) | `write` |
| `PUT` | `/api/v1/ideas/:id` | Mettre à jour une idée | `write` |
| `DELETE` | `/api/v1/ideas/:id` | Supprimer une idée | `write` ou `admin` |
| `PATCH` | `/api/v1/ideas/:id/processed` | Marquer une idée comme traitée | `write` ou `admin` |

Le champ `status` (`'brouillon'` / `'publié'`) est accepté sur `setArticle` et `editArticle`.

---

**Note :** L'URL d'administration cachée s'affiche dans les logs au démarrage du backend.
