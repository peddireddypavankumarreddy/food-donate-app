require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Request = require('./models/Request');
const Donation = require('./models/Donation');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Dashboard data (public)
app.get('/api/admin', async (req, res) => {
  try {
    const [unfulfilledRequests, unclaimedDonations, totalUsers, totalRequests, totalDonations] = await Promise.all([
      Request.find({ fulfilled: false }).select('-userId'),
      Donation.find({ claimed: false }).select('-userId'),
      User.countDocuments(),
      Request.countDocuments(),
      Donation.countDocuments()
    ]);
    
    res.json({ 
      unfulfilledRequests, 
      unclaimedDonations,
      stats: {
        totalUsers,
        totalRequests,
        totalDonations,
        activeRequests: unfulfilledRequests.length,
        activeDonations: unclaimedDonations.length
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Routes - mounted
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const donationRoutes = require('./routes/donationRoutes');

app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected (local)'))
  .catch(err => console.error('MongoDB Error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
