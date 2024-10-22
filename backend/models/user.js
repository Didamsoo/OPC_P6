const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Utilisation du plugin uniqueValidator pour garantir l'unicité des emails
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
