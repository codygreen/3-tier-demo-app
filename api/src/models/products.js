const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: String,
  description: String,
  imageUrl: String,
  averageRating: String
});

module.exports = mongoose.model('Products', productsSchema);