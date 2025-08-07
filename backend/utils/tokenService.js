// generate tokenService.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const tokenService = {
  generateToken: function(payload) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_SECRET_EXPIRES_IN || '1d';
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return jwt.sign(payload, secret, { expiresIn });
  },
  verifyToken: function(token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  } 
};
module.exports = tokenService;
