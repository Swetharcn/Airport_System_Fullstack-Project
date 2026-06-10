const nodemailer = require('nodemailer');

/**
 * Smart Notification Service
 * Handles sending emails using Nodemailer and creating in-app Notification records.
 * Uses Ethereal Mail for zero-config testing (catches emails so you don't need a real SMTP server for development).
 */

let transporter = null;

/**
 * Initialize the Nodemailer transporter.
 * If EMAIL_USER and EMAIL_PASS are in .env, it uses Gmail.
 * Otherwise, it creates an ephemeral Ethereal test account automatically.
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production / Real Email (e.g., Gmail)
    console.log('📧 Initialising email service with real SMTP credentials');
    transporter = nodemailer.createTransport({
      service: 'gmail', // or configured SMTP host
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development / Test Email (Ethereal)
    console.log('📧 Creating Ethereal Mail test account (check logs for preview links)...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

/**
 * Send an email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailer = await initTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AirAssist Smart Airport" <notifications@airassist.local>',
      to,
      subject,
      html,
    };

    const info = await mailer.sendMail(mailOptions);
    
    // If using Ethereal, log the URL so the developer can click and view the sent email
    if (!process.env.EMAIL_USER) {
      console.log(`✉️ Test Email sent to ${to}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail
};
