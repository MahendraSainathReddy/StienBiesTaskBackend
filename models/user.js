const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  bankBalance: { type: Number, default: 0 },
  ownedAssets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;