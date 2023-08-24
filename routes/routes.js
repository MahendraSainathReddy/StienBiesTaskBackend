// routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Asset = require('../models/asset');
const SoldAsset = require('../models/soldAsset');

router.post('/register', async (req, res) => {
  try {
    const { username, age, gender, dob, bankBalance } = req.body;

    console.log(req.body);

    const existingUser = await User.findOne({ name: username });
    if (existingUser) {
      return res.status(400).json({ message: 'name already exists' });
    }

    const newUser = new User({
      username,
      age,
      gender,
      dob,
      bankBalance
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'User registration failed', error: error.message });
  }
});

router.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.find({}, '-_id name quantity cost');

    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching asset details', error: error.message });
  }
});

router.post('/create-asset', async (req, res) => {
  try {
    const newAsset = new Asset({
      name: req.body.name,
      quantity: req.body.quantity,
      cost: req.body.cost,
    });

    const savedAsset = await newAsset.save();
    res.status(201).json(savedAsset);
  } catch (error) {
    res.status(400).json({ message: 'Asset creation failed', error: error.message });
  }
});

router.post('/purchase-asset', async (req, res) => {
  try {
    const { userId, assetName } = req.body;

    // Find the asset by name
    const asset = await Asset.findOne({ name: assetName });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check if the user exists
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has enough balance to make the purchase
    if (user.bankBalance < asset.cost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const existingSoldAsset = await SoldAsset.findOne({
      userId: userId,
      assetName: assetName,
    });

    if (existingSoldAsset) {
      return res.status(400).json({ message: 'Asset already owned by the user' });
    }

    // Deduct the cost from the user's bank balance
    user.bankBalance -= asset.cost;
    await user.save();

    // Record the purchase in the SoldAsset collection
    const soldAsset = new SoldAsset({
      userId: userId,
      assetName: asset.name,
      quantity: 1, // Assuming each user can purchase only one unit
      cost: asset.cost,
    });
    await soldAsset.save();

    user.ownedAssets.push(asset._id);
    await user.save();

    res.status(200).json({ message: 'Asset purchased successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing asset', error: error.message });
  }
});

router.get('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ name: username })
      .populate('ownedAssets') // Populate the ownedAssets field with Asset documents
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Owned Assets:', user.ownedAssets);

    // The user.ownedAssets array now contains populated Asset documents
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});



module.exports = router;
