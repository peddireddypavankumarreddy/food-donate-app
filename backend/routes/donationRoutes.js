const express = require('express');
const { createDonation, claimDonation, getUserDonations } = require('../controllers/donation');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createDonation);
router.delete('/:id', auth, claimDonation);
router.get('/', auth, getUserDonations);

module.exports = router;

