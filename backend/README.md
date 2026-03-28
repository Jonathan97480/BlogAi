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

---

**Note :** L'URL d'administration cachée s'affiche dans les logs au démarrage du backend.
