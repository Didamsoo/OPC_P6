const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config'); // Middleware pour gérer les images
const Book = require('../models/book');

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

// Route pour créer un livre avec une image
router.post('/', multer, async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    const book = new Book({
      userId: bookData.userId,
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      genre: bookData.genre,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: bookData.ratings || [],
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
