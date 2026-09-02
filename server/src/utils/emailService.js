const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME } = require('../config/env');

const isEmailConfigured = SMTP_USER && SMTP_PASS;

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
}

async function sendEmail({ to, subject, html, text }, retries = 3) {
  if (!isEmailConfigured) {
    console.log(`📧 EMAIL (not configured) To: ${to} | Subject: ${subject}`);
    return { sent: false };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`📧 Email sent to ${to} (attempt ${attempt})`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error(`📧 Attempt ${attempt}/${retries} failed for ${to}: ${error.message}`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 3000));
      }
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



// const { Resend } = require('resend');
// const { FROM_EMAIL, FROM_NAME } = require('../config/env');

// const resend = process.env.RESEND_API_KEY 
//   ? new Resend(process.env.RESEND_API_KEY)
//   : null;

// async function sendEmail({ to, subject, html, text }) {
//   if (!resend) {
//     console.log('\n📧 EMAIL (not sent — RESEND_API_KEY not configured)');
//     console.log(`   To: ${to} | Subject: ${subject}\n`);
//     return { sent: false };
//   }

//   try {
//     const { data, error } = await resend.emails.send({
//       from: `${FROM_NAME} <onboarding@resend.dev>`,
//       to,
//       subject,
//       html,
//       text,
//     });

//     if (error) {
//       console.error(`📧 Failed: ${error.message}`);
//       return { sent: false, reason: error.message };
//     }

//     console.log(`📧 Email sent to ${to}`);
//     return { sent: true, id: data.id };
//   } catch (error) {
//     console.error(`📧 Failed: ${error.message}`);
//     return { sent: false, reason: error.message };
//   }
// }

// async function sendCapsuleUnlockEmail(user, capsule) {
//   return sendEmail({
//     to: user.email,
//     subject: `🔓 Your time capsule "${capsule.title}" is now open!`,
//     html: `
//       <div style="font-family: system-ui; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
//         <h1 style="text-align: center;">🕰️ Time Capsule Opened!</h1>
//         <p style="text-align: center; color: #9ca3af;">A message from your past has arrived.</p>
//         <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
//           <h2 style="color: #a78bfa;">${capsule.title}</h2>
//         </div>
//       </div>
//     `,
//   });
// }

// module.exports = { sendEmail, sendCapsuleUnlockEmail };


// const nodemailer = require('nodemailer');
// const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME } = require('../config/env');

// /**
//  * Email Service
//  * 
//  * Sends email notifications using Nodemailer + Gmail SMTP.
//  * If SMTP credentials are not configured, it logs the email
//  * to the console instead — so the app works without email setup.
//  * 
//  * TO SET UP GMAIL:
//  * 1. Go to your Google Account → Security → 2-Step Verification (enable it)
//  * 2. Then go to App Passwords → Generate one for "Mail"
//  * 3. Copy the 16-character password into your .env as SMTP_PASS
//  * 4. Set SMTP_USER and FROM_EMAIL to your Gmail address
//  */

// // Check if email is configured
// const isEmailConfigured = SMTP_USER && SMTP_PASS;

// // Create transporter only if credentials exist
// let transporter = null;

// if (isEmailConfigured) {
//   transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: SMTP_PORT,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: SMTP_USER,
//       pass: SMTP_PASS,
//     },
//   });
// }

// /**
//  * Send an email notification
//  * Falls back to console logging if email isn't configured
//  */
// async function sendEmail({ to, subject, html, text }) {
//   if (!isEmailConfigured) {
//     // Log to console instead of sending
//     console.log('\n📧 EMAIL NOTIFICATION (not sent — SMTP not configured)');
//     console.log(`   To: ${to}`);
//     console.log(`   Subject: ${subject}`);
//     console.log(`   Message: ${text || 'See HTML body'}`);
//     console.log('   → Configure SMTP_USER and SMTP_PASS in .env to send real emails\n');
//     return { sent: false, reason: 'SMTP not configured' };
//   }

//   try {
//     const info = await transporter.sendMail({
//       from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
//       to,
//       subject,
//       text,
//       html,
//     });

//     console.log(`📧 Email sent to ${to}: ${info.messageId}`);
//     return { sent: true, messageId: info.messageId };
//   } catch (error) {
//     console.error(`📧 Failed to send email to ${to}:`, error.message);
//     return { sent: false, reason: error.message };
//   }
// }

// /**
//  * Send capsule unlock notification
//  */
// async function sendCapsuleUnlockEmail(user, capsule) {
//   const subject = `🔓 Your time capsule "${capsule.title}" is now open!`;

//   const html = `
//     <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a1a; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
//       <h1 style="text-align: center; margin-bottom: 0.5rem;">🕰️ Time Capsule Opened!</h1>
//       <p style="text-align: center; color: #9ca3af; margin-bottom: 2rem;">A message from your past has arrived.</p>
      
//       <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
//         <h2 style="color: #a78bfa; margin-bottom: 0.5rem;">${capsule.title}</h2>
//         <p style="color: #9ca3af; font-size: 0.85rem; margin-bottom: 1rem;">
//           Created on ${new Date(capsule.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//         </p>
//         ${capsule.content ? `<p style="line-height: 1.7; white-space: pre-wrap;">${capsule.content}</p>` : '<p style="color: #6b7280;">No text message — check the app for attachments.</p>'}
//       </div>

//       <p style="text-align: center; margin-top: 2rem; color: #6b7280; font-size: 0.8rem;">
//         Virtual Time Capsule — Preserve today. Unlock tomorrow.
//       </p>
//     </div>
//   `;

//   const text = `Your time capsule "${capsule.title}" is now open! ${capsule.content || 'Check the app to view it.'}`;

//   return sendEmail({
//     to: user.email,
//     subject,
//     html,
//     text,
//   });
// }

// module.exports = {
//   sendEmail,
//   sendCapsuleUnlockEmail,
// };
