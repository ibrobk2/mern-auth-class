const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/emailService');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { generateOTP, hashOTP } = require('../utils/otpService');
const { generateToken } = require('../utils/tokenService');
    
// Connect to the database
connectDB();

// User registration
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email, password });
    user.password = await bcrypt.hash(password, 10);
    
    // Save user to database
    await user.save();

    // Send verification email
    await sendVerificationEmail(user);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {    
      return res.status(400).json({ message: 'Invalid email or password' });
    }   
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // Generate JWT token
    const token = generateToken(user._id);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService'); 
const { generateToken } = require('../utils/tokenService');



module.exports = {
  registerUser,
  loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser
    };

