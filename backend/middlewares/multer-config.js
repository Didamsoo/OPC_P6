const multer = require('multer');
const path = require('path');

// Configuration du stockage des images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = path.extname(file.originalname);
    callback(null, `${name}_${Date.now()}${extension}`);
  }
});

// Export du middleware multer pour gérer l'upload d'image
module.exports = multer({ storage: storage }).single('image');
