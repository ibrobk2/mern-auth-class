// generate otpService.js
const crypto = require('crypto');   
const { OTP_EXPIRATION_TIME } = require('../config/constants.js');
const otpService = {
  generateOTP: function() {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
    return { otp, expiresAt };
  } 
};
module.exports = otpService;
