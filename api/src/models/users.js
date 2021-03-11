import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
  id: String,
  cartItems: [String] 
});

module.exports = mongoose.model('Users', usersSchema);