const express = require('express');
const router = express.Router();
const { upload, processImage } = require('../middlewares/multer-config');
const auth = require('../middlewares/auth');
const Book = require('../models/book');



// Route pour récupérer tous les livres
router.get('/', async (req, res) => {
  try {
    // Je récupère tous les livres de la base de données
    const books = await Book.find();
    res.status(200).json(books); // J'envoie la liste complète des livres
  } catch (error) {
    // En cas d'erreur, j'envoie un code 404 avec le message d'erreur
    res.status(404).json({ error: error.message });
  }
});


// Route pour récupérer un livre par son ID
router.get('/:id', async (req, res) => {
  try {
    // Je récupère un livre spécifique à partir de l'ID fourni en paramètre
    const book = await Book.findById(req.params.id);
    if (!book) {
      // Si le livre n'est pas trouvé, j'envoie un message d'erreur avec un code 404
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    // Si le livre est trouvé, je le retourne avec un code 200
    res.status(200).json(book);
  } catch (error) {
    // En cas d'erreur, j'envoie un code 500 avec le message d'erreur
    console.error('Erreur lors de la récupération du livre :', error);
    res.status(500).json({ error: error.message });
  }
});


// Route pour créer un livre (avec gestion des images et authentification)
router.post('/', auth, upload.single('image'), processImage, async (req, res) => {
  try {
    // Je parse les données du livre envoyées dans la requête
    const bookData = JSON.parse(req.body.book);
    const userId = req.userId; // Je récupère l'ID utilisateur à partir du token JWT

    // J'ajoute des notes si elles existent
    const ratings = bookData.ratings ? bookData.ratings.map(rating => ({
      userId,  // J'utilise l'ID utilisateur du token JWT
      grade: rating.grade
    })) : [];

    // Création d'un nouvel objet livre avec les données fournies
    const book = new Book({
      userId: userId, // J'associe l'ID utilisateur au livre
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      genre: bookData.genre,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // URL de l'image
      ratings: ratings, // J'inclus les notes du livre
      averageRating: bookData.averageRating || 0, // Moyenne des notes
    });

    await book.save(); // J'enregistre le livre dans la base de données
    res.status(201).json(book); // Je retourne le livre avec un code de succès 201
  } catch (error) {
    // En cas d'erreur, j'affiche un message d'erreur et retourne un code 400
    console.error('Erreur lors de la création du livre :', error);
    res.status(400).json({ error: error.message });
  }
});


// Route pour mettre à jour un livre 
router.put('/:id', auth, upload.single('image'), processImage, async (req, res) => {
  try {
    // Je parse les données du livre depuis la requête
    const bookData = JSON.parse(req.body.book);
    // Je mets à jour les données du livre, y compris l'image si elle est fournie
    const updatedData = {
      ...bookData,
      imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : bookData.imageUrl
    };

    // Je trouve le livre par ID et le mets à jour avec les nouvelles données
    const book = await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book); // J'envoie le livre mis à jour au client
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre :', error);
    res.status(400).json({ error: error.message });
  }
});


// Route pour supprimer un livre
router.delete('/:id', auth, async (req, res) => {
  try {
    // Je cherche le livre par ID et le supprime
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json({ message: 'Livre supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre :', error);
    res.status(500).json({ error: error.message });
  }
});


// Route pour ajouter une notation à un livre
router.post('/:id/rating', auth, async (req, res) => {
  try {
    const { rating } = req.body; // J'extrais la note de la requête
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Je vérifie si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(r => r.userId === req.userId);
    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    // J'ajoute la nouvelle note et mets à jour la moyenne
    book.ratings.push({ userId: req.userId, grade: parseInt(rating, 10) });
    const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = totalRatings / book.ratings.length;

    await book.save(); // J'enregistre les modifications
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route pour récupérer les livres les mieux notés
router.get('/bestrating', async (req, res) => {
  try {
    // Je récupère les 3 livres ayant la meilleure moyenne de notes, triés par ordre décroissant
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(bestRatedBooks); // J'envoie les livres au client avec un code de succès 200
  } catch (error) {
    // En cas d'erreur, je retourne un code 500 avec le message d'erreur
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // J'exporte le routeur pour l'utiliser ailleurs
