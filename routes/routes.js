// routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Asset = require('../models/asset');
const SoldAsset = require('../models/soldAsset');

router.post('/register', async (req, res) => {
  try {
    const { name, age, gender, dob, bankBalance } = req.body;

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: 'name already exists' });
    }

    const newUser = new User({
      name,
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

router.post('/sell-asset', async (req, res) => {
  try {
    const user = req.body.userId; // Assuming you have the user's ID after authentication
    const asset = req.body.assetId; // Assuming you have the asset's ID
    const quantity = req.body.quantity;

    const soldAsset = new SoldAsset({
      asset: asset,
      user: user,
      quantity: quantity,
    });

    const savedSoldAsset = await soldAsset.save();
    res.status(201).json(savedSoldAsset);
  } catch (error) {
    res.status(400).json({ message: 'Asset sale failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
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
    const user = await User.findById(userId);
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

router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
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
