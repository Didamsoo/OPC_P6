const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config'); // Middleware pour gérer les images
const auth = require('../middlewares/auth'); // Importer le middleware d'authentification
const Book = require('../models/book');

// Route pour récupérer les livres les mieux notés (par exemple les 3 premiers)
router.get('/bestrating', async (req, res) => {
  try {
    // Trouver les livres triés par note moyenne (averageRating) dans l'ordre décroissant, et en limiter à 3
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(bestRatedBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer tous les livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Route pour récupérer un livre par son ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre :', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer un livre (avec auth middleware)
router.post('/', auth, multer, async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    const userId = req.userId;  // Récupérer l'ID utilisateur à partir du token JWT
    
    // Ajouter le userId au tableau ratings si la note existe
    const ratings = bookData.ratings ? bookData.ratings.map(rating => ({
      userId,  // Utiliser l'ID utilisateur du token JWT
      grade: rating.grade
    })) : [];

    const book = new Book({
      userId: userId,  // Utiliser l'ID utilisateur du token JWT pour l'utilisateur ayant créé le livre
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      genre: bookData.genre,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: ratings,  // Inclure le tableau ratings avec le userId
      averageRating: bookData.averageRating || 0,
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Erreur lors de la création du livre :', error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour mettre à jour un livre (PUT /api/books/:id)
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre :', error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour supprimer un livre (DELETE /api/books/:id)
router.delete('/:id', auth, async (req, res) => {
  try {
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
    const { rating } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(r => r.userId === req.userId);
    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    // Ajouter la nouvelle notation avec le vrai userId
    book.ratings.push({ userId: req.userId, grade: parseInt(rating, 10) });

    // Recalculer la note moyenne
    const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = totalRatings / book.ratings.length;

    // Sauvegarder les modifications
    await book.save();
    
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
