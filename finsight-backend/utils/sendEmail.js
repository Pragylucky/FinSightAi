// utils/sendEmail.js
// Transactional email. Two transports, picked by env:
//   1. RESEND_API_KEY set  -> Resend HTTPS API (works on hosts that block SMTP ports)
//   2. otherwise           -> SMTP via nodemailer (EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS)
// Every send has a hard timeout so a blocked SMTP port can never hang a request.

const axios = require('axios');
const nodemailer = require('nodemailer');

const TIMEOUT_MS = 10_000;

const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let transporter;
const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, // implicit TLS on 465, STARTTLS otherwise
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: TIMEOUT_MS,
      greetingTimeout: TIMEOUT_MS,
      socketTimeout: TIMEOUT_MS,
    });
  }
  return transporter;
};

const isConfigured = () =>
  Boolean(process.env.RESEND_API_KEY) ||
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (process.env.RESEND_API_KEY) {
    await axios.post(
      'https://api.resend.com/emails',
      { from, to: [to], subject, html, text },
      { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, timeout: TIMEOUT_MS }
    );
    return;
  }

  await getTransporter().sendMail({ from, to, subject, html, text });
};

// ── Templates ────────────────────────────────────────────────

const shell = (title, body) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0D0C0B; color: #F6F1EA; padding: 32px; border-radius: 12px;">
    <h1 style="color: #F5B544; font-size: 22px; margin: 0 0 8px;">FinSight AI</h1>
    <h2 style="font-size: 18px; margin: 0 0 16px;">${title}</h2>
    ${body}
  </div>`;

const sendVerificationCode = async (email, name, code) => {
  await sendEmail({
    to: email,
    subject: `${code} is your FinSight AI verification code`,
    text: `Hi ${name}, your FinSight AI verification code is ${code}. It expires in 15 minutes. If you didn't sign up, ignore this email.`,
    html: shell('Verify your email', `
      <p style="color: #A89F94; line-height: 1.6;">Hi ${escapeHtml(name)}, enter this code to activate your account:</p>
      <p style="font-family: 'Courier New', monospace; font-size: 34px; letter-spacing: 10px; font-weight: 700; color: #F5B544; background: #161412; border: 1px solid #2C2824; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">${code}</p>
      <p style="color: #6B645B; font-size: 12px;">The code expires in 15 minutes. If you didn't create an account, you can ignore this email.</p>`),
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your FinSight AI password',
    text: `Hi ${name}, reset your password here: ${resetUrl} (valid for 1 hour). If you didn't ask for this, ignore this email.`,
    html: shell('Reset your password', `
      <p style="color: #A89F94; line-height: 1.6;">Hi ${escapeHtml(name)}, we received a request to reset your password.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #F5B544; color: #0D0C0B; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset password</a>
      <p style="color: #6B645B; font-size: 12px;">This link expires in 1 hour. If you didn't request it, your password won't change.</p>`),
  });
};

module.exports = { sendVerificationCode, sendPasswordResetEmail, isConfigured };
