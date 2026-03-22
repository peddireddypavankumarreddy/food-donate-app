const express = require('express');
const { register, login, getProfile, uploadProfilePic } = require('../controllers/user');
const auth = require('../middleware/auth');
const upload = require('../middleware/multerConfig');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/profile-pic', auth, upload.single('image'), uploadProfilePic);

module.exports = router;

