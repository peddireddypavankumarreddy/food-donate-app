require('dotenv').config();
const Request = require('../models/Request');

// Create request
const createRequest = async (req, res) => {
  try {
    const request = new Request({ ...req.body, userId: req.user.id });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Fulfill request (mark as fulfilled)
const fulfillRequest = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, userId: req.user.id });
    if (!request) return res.status(404).json({ msg: 'Not found' });
    request.fulfilled = true;
    await request.save();
    res.json({ msg: 'Fulfilled' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get user's requests
const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { createRequest, fulfillRequest, getUserRequests };

