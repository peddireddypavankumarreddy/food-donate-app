const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { JWT_SECRET } = process.env;

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ user: { id: user._id, name, email, role: user.role }, token });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ user: { id: user._id, name: user.name, email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Upload profile photo
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.filename },
      { new: true }
    ).select('-password');
    
    res.json({ 
      msg: 'Profile photo updated',
      user: { 
        ...user.toObject(), 
        profilePic: req.file.filename 
      } 
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { register, login, getProfile, uploadProfilePic };

