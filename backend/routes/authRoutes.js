// /routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Route pour l'inscription
router.post('/signup', async (req, res) => {
  try {
    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });
    // Sauvegarde de l'utilisateur dans la base de données
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé !' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour la connexion
router.post('/login', async (req, res) => {
  try {
    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé !' });
    }
    
    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe incorrect !' });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      userId: user._id,
      token: token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
