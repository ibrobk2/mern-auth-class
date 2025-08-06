// generate emailService.js code snippet
const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = process.env;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.esystems.com.ng',
    port: process.env.EMAIL_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: `"E-Systems" <${EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    html: `<p>Please verify your email by clicking on the following link:</p><a href="${verificationUrl}">Verify Email</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}