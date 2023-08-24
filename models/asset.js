const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
