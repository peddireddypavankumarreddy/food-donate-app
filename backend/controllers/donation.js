require('dotenv').config();
const Donation = require('../models/Donation');

// Create donation
const createDonation = async (req, res) => {
  try {
    const donation = new Donation({ ...req.body, userId: req.user.id });
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Claim donation (mark as claimed)
const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!donation) return res.status(404).json({ msg: 'Not found' });
    donation.claimed = true;
    await donation.save();
    res.json({ msg: 'Claimed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get user's donations
const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user.id });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { createDonation, claimDonation, getUserDonations };

