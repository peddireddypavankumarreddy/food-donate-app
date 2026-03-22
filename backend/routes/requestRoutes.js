const express = require('express');
const { createRequest, fulfillRequest, getUserRequests } = require('../controllers/request');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createRequest);
router.delete('/:id', auth, fulfillRequest);
router.get('/', auth, getUserRequests);

module.exports = router;

