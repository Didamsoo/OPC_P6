const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialisation des variables d'environnement pour accéder aux configurations sensibles
dotenv.config();
const app = express(); // J'ai créé une instance d'application Express

// J'ai configuré CORS pour permettre les requêtes entre différents domaines (frontend et backend)
app.use(cors());

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Connexion à la base de données MongoDB via l'URI stockée dans .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

// J'ai configuré le serveur pour servir les fichiers d'images statiques
app.use('/images', express.static('images'));

// J'ai défini les routes pour les fonctionnalités de livres et d'authentification
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

// Démarrage du serveur sur le port défini ou sur le port 4000 par défaut
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
