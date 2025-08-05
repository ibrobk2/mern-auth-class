const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },    
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
    type: String,
    required: [true, 'Password is required'],   
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Exclude password from query results by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    },
    createdAt: {    
    type: Date,
    default: Date.now,
    },
    updatedAt: {
    type: Date,
    default: Date.now,
    },
    isVerified: {
    type: Boolean,
    default: false,
    },
    otp_token: {
    type: String,
    default: null,
    },
    otp_expiry: {
    type: Date,
    default: null,
    },
    status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    },
});

// Middleware to update the updatedAt field before saving
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
    if (!this.isModified('password')) {
    return next();}
    // Hash the password before saving
    
    // const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Middleware to hash password before saving
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Method to generate a JWT token
userSchema.methods.getSignedJwtToken = function() {
  const id = this._id;
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
    return jwt.sign(id, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
  });
}
// Method to generate OTP token
userSchema.methods.generateOtpToken = function() {
  const otpToken = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp_token = otpToken;
  this.otp_expiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  return otpToken;  
}
userSchema.methods.isOtpValid = function(otp) {
  return this.otp_token === otp && this.otp_expiry > Date.now();    
}

const User = mongoose.model('User', userSchema);

module.exports = User;


connectDB().then(() => {
  console.log('Database connection established');
}).catch((error) => {
  console.error('Database connection error:', error);
});