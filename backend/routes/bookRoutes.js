const express = require('express');
const router = express.Router();
const { upload, processImage } = require('../middlewares/multer-config');
const auth = require('../middlewares/auth');
const Book = require('../models/book');

// Route pour récupérer les livres les mieux notés
router.get('/bestrating', async (req, res) => {
  try {
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

// Route pour créer un livre (avec gestion des images et authentification)
router.post('/', auth, upload.single('image'), processImage, async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    const userId = req.userId;

    const ratings = bookData.ratings ? bookData.ratings.map(rating => ({
      userId,
      grade: rating.grade
    })) : [];

    const book = new Book({
      userId: userId,
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      genre: bookData.genre,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: ratings,
      averageRating: bookData.averageRating || 0,
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Erreur lors de la création du livre :', error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour mettre à jour un livre (auth middleware, gestion des images)
router.put('/:id', auth, upload.single('image'), processImage, async (req, res) => {
  try {
    const bookData = req.body.book ? JSON.parse(req.body.book) : req.body; // Vérifie si les données sont envoyées sous forme de `FormData` ou JSON
    const updatedData = {
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      genre: bookData.genre,
      imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : bookData.imageUrl
    };

    const book = await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre :', error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour supprimer un livre
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

    const existingRating = book.ratings.find(r => r.userId === req.userId);
    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    book.ratings.push({ userId: req.userId, grade: parseInt(rating, 10) });
    const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = totalRatings / book.ratings.length;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
