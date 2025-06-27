const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send an email
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"E-Learning Platform" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = { sendEmail };