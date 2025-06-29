const express = require('express');
const { registerUser, loginUser , logoutUser, updateProfile, authCheck } = require('../Controllers/authController');
const router = express.Router();
const upload = require('../Helper/index.helper');
const auth = require('../Middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put("/update-profile",auth, upload.single("profilePic"), updateProfile);
router.get('/check', auth, authCheck);

module.exports = router; 