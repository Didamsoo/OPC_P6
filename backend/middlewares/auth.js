const jwt = require('jsonwebtoken');
const user = require('../models/user');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Récupérer le token dans l'en-tête Authorization
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Décoder le token
    req.userId = decodedToken.userId; // Extraire l'ID utilisateur du token
    next();
  } catch (error) {
    res.status(401).json({ message: 'Requête non authentifiée !' });
  }
};