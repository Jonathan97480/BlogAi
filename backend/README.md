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

Pour lancer les tests unitaires (hashage mot de passe, connexion DB) :
```bash
npm test
```

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
| `GET` | `/api/v1/ideas` | Récupérer toutes les idées | `read` |
| `GET` | `/api/v1/ideas/:id` | Récupérer une idée précise | `read` |
| `POST` | `/api/v1/ideas` | Créer une nouvelle idée (`title`, `category_id`, `content` requis) | `write` |
| `DELETE` | `/api/v1/ideas/:id` | Supprimer une idée | `write` ou `admin` |
| `PATCH` | `/api/v1/ideas/:id/processed` | Marquer une idée comme traitée | `write` ou `admin` |

---

**Note :** L'URL d'administration cachée s'affiche dans les logs au démarrage du backend.
