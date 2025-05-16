// backend/src/config/emailConfig.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensures .env variables are loaded

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // Default to gmail, can be overridden
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // For some providers, especially local test servers like MailHog, you might need:
    // secure: false, // true for 465, false for other ports
    // tls: {
    //     rejectUnauthorized: false // Only for development/testing with self-signed certs
    // }
});

// Verify transporter configuration on startup (optional, but good for debugging)
transporter.verify(function (error, success) {
  if (error) {
    console.error("Nodemailer transporter verification error:", error.message);
    console.error("Hint: Check your EMAIL_USER and EMAIL_PASS in .env, and Gmail 'App Password' or 'Less Secure App Access' settings.");
  } else {
    console.log("Nodemailer transporter is ready to send emails from:", process.env.EMAIL_USER);
  }
});


const sendMail = async (to, subject, htmlContent) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email credentials (EMAIL_USER, EMAIL_PASS) are not set in .env file.');
        return false;
    }
    try {
        await transporter.sendMail({
            from: `"Anime Manga Blog" <${process.env.EMAIL_USER}>`, // Sender address
            to: to, // List of receivers
            subject: subject, // Subject line
            html: htmlContent, // HTML body content
        });
        console.log('Email sent successfully to:', to);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        // Log more specific error details if available
        if (error.responseCode) {
            console.error('Email sending failed with response code:', error.responseCode);
            console.error('Response:', error.response);
        }
        return false;
    }
};

module.exports = { sendMail, transporter };