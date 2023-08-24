const mongoose = require('mongoose');

const soldAssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetName: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
});

const SoldAsset = mongoose.model('SoldAsset', soldAssetSchema);

module.exports = SoldAsset;
