// utils/sendEmail.js
// Sends transactional emails via Nodemailer
// Uses Gmail SMTP with App Password (not your regular Gmail password)
//
// Setup:
// 1. Go to Google Account → Security → 2-Step Verification (enable if not done)
// 2. Then go to App Passwords → Select "Mail" → Generate
// 3. Copy that 16-char password → put in EMAIL_PASS in .env

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generic send function
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// ── Email templates ───────────────────────────────────────────

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your FinSight AI account',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; background: #0B0F1A; color: #F0F4FF; padding: 32px; border-radius: 12px;">
        <h1 style="color: #00D4FF; font-size: 24px; margin-bottom: 8px;">FinSight AI</h1>
        <h2 style="color: #F0F4FF; font-size: 20px; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #8899AA; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #8899AA; line-height: 1.6;">Thanks for signing up! Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #00D4FF; color: #0B0F1A; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
          Verify Email Address
        </a>
        <p style="color: #4A5568; font-size: 12px; margin-top: 24px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your FinSight AI password',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; background: #0B0F1A; color: #F0F4FF; padding: 32px; border-radius: 12px;">
        <h1 style="color: #00D4FF; font-size: 24px; margin-bottom: 8px;">FinSight AI</h1>
        <h2 style="color: #F0F4FF; font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #8899AA; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #00D4FF; color: #0B0F1A; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #4A5568; font-size: 12px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, ignore this email and your password won't change.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
