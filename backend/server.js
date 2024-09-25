// /server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Middleware pour gérer les requêtes cross-origin
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Utilisation de CORS pour permettre les requêtes entre le frontend (port 3000) et le backend (port 4000)
app.use(cors());

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

// Servir les fichiers statiques (images)
app.use('/images', express.static('images'));

// Routes API pour les livres et l'authentification
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

// Démarrage du serveur sur le port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
