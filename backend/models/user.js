const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Je créé le schéma pour le modèle 'User' qui définit la structure des documents dans la collection 'users'
const userSchema = new mongoose.Schema({
  
  email: { type: String, required: true, unique: true }, // Email de l'utilisateur, obligatoire et unique pour éviter les doublons

  
  password: { type: String, required: true } // Mot de passe de l'utilisateur, obligatoire et stocké sous forme de 'String'
});

// J'ai utilisé le plugin uniqueValidator pour appliquer une validation supplémentaire afin de garantir que chaque email soit unique
userSchema.plugin(uniqueValidator);

// J'ai exporté le modèle 'User' basé sur le schéma 'userSchema' pour pouvoir l'utiliser dans d'autres parties du projet
module.exports = mongoose.model('User', userSchema);
