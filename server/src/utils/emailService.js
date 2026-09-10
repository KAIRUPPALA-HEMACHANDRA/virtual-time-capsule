const { BREVO_API_KEY, FROM_EMAIL, FROM_NAME } = require('../config/env');

/**
 * Email Service — Brevo HTTP API
 * 
 * WHY BREVO INSTEAD OF NODEMAILER:
 * Nodemailer uses SMTP (port 587) which is blocked on Render's free tier.
 * Brevo uses a regular HTTPS POST request — works everywhere.
 * Free tier: 300 emails/day, no credit card required.
 * 
 * HOW IT WORKS:
 * 1. We send a POST request to Brevo's API with the email details
 * 2. Brevo handles the actual SMTP delivery on their servers
 * 3. We get back a success/failure response
 * 
 * SETUP:
 * 1. Sign up at brevo.com
 * 2. Go to SMTP & API → API Keys → Generate
 * 3. Add BREVO_API_KEY to your .env file
 */

const isEmailConfigured = !!BREVO_API_KEY;

async function sendEmail({ to, subject, html, text }, retries = 3) {
  if (!isEmailConfigured) {
    console.log(`📧 EMAIL (not configured) To: ${to} | Subject: ${subject}`);
    return { sent: false };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: [{ email: to }],
          subject,
          htmlContent: html || `<p>${text}</p>`,
          textContent: text || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📧 Email sent to ${to} (attempt ${attempt})`);
        return { sent: true, messageId: data.messageId };
      }

      const error = await response.json();
      console.error(`📧 Attempt ${attempt}/${retries} failed for ${to}: ${error.message || response.statusText}`);
    } catch (error) {
      console.error(`📧 Attempt ${attempt}/${retries} failed for ${to}: ${error.message}`);
    }

    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.error(`📧 All ${retries} attempts failed for ${to}`);
  return { sent: false };
}

async function sendCapsuleUnlockEmail(user, capsule) {
  return sendEmail({
    to: user.email,
    subject: `🔓 Your time capsule "${capsule.title}" is now open!`,
    html: `
      <div style="font-family: system-ui; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
        <h1 style="text-align: center;">🕰️ Time Capsule Opened!</h1>
        <p style="text-align: center; color: #9ca3af;">A message from your past has arrived.</p>
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
          <h2 style="color: #a78bfa;">${capsule.title}</h2>
        </div>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendCapsuleUnlockEmail };
