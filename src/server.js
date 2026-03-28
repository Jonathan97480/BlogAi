import app from './index.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_PATH = '/hidden-admin-gate';
app.listen(PORT, () => {
    console.log(`Serveur backend démarré sur le port ${PORT}`);
    console.log(`URL d'administration (cachée) : ${BASE_URL}${ADMIN_PATH}`);
});
