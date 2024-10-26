const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const processImage = async (req, res, next) => {
  // Si aucun fichier n'est présent dans la requête, je passe au middleware suivant
  if (!req.file) {
    return next();
  }

  try {
    const fileName = `${req.file.originalname.split(' ').join('_')}_${Date.now()}.jpg`;

    // J'ai défini le chemin où l'image traitée sera sauvegardée
    const outputPath = path.join('images', fileName);

    // J'ai utilisé Sharp pour redimensionner et optimiser l'image
    await sharp(req.file.buffer)

      .resize({ width: 463, height: 595, fit: sharp.fit.cover }) 
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    req.file.filename = fileName;

    next();
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image avec Sharp :', error);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'image.' });
  }
};

module.exports = { upload, processImage };
