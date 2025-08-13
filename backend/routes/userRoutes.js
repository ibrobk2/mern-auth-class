const express = require('express');
// const connectDB = require('../config/db');
const {registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser, verifyEmail} = require('../controllers/authController.js');
const router = express.Router();

// Connect to the database
// connectDB();
// User registration route
router.post('/register', registerUser);
// User login route
router.post('/login', loginUser);
// Get user profile route
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
// Delete user route
router.delete('/profile', deleteUser);
router.get('/verify-email', verifyEmail);
    
module.exports = router;
