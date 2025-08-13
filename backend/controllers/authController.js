const connectDB = require('../config/db');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/emailService');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { generateOTP, hashOTP } = require('../utils/otpService');
const { generateToken } = require('../utils/tokenService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

    
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
    
    // Save user to database (password will be hashed by pre-save middleware)
    await user.save();


    // Generate verification token
    const verificationToken = generateToken({ userId: user._id, email: user.email });
    
    // Send verification email with proper parameters
    await sendVerificationEmail(user.email, verificationToken);

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
    console.error('Validation error:', errors.array());
    return res.status(400).json({ errors: errors.array() });
    }
    try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {    
      console.error('User not found:', email);
      return res.status(400).json({ message: 'User not found' });

    }   
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid password entered' });
    }
    // Generate JWT token
    const token = generateToken({id:user._id});
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, password: user.password } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return res.status(200).json({ message: 'Login successful' });

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

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update user email verification status
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });
    console.log('Email verification successful for user:', user.email);


  } catch (error) {
    console.error('Email verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

// const { sendVerificationEmail } = require('../utils/emailService'); 
// const { generateToken } = require('../utils/tokenService');



module.exports = {
  registerUser,
  loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    verifyEmail,
    };
