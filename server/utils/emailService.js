const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"SkillSync AI" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log('✅ Email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
}

const emailService = {
  sendApplicationUpdateEmail: async (email, name, internshipTitle, status) => {
    return sendEmail(email, `Application Update: ${internshipTitle}`,
      `<p>Hi ${name}, your application for <strong>${internshipTitle}</strong> status is now: <strong>${status}</strong>.</p>`
    );
  },

  sendShortlistEmail: async (email, name, internshipTitle, company) => {
    return sendEmail(
      email,
      `🎉 You've been shortlisted — ${internshipTitle} at ${company}`,
      `<!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f9fafb; margin:0; padding:20px;">
        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#1e293b,#0f172a); padding:32px; text-align:center;">
            <h1 style="color:#22d3ee; font-size:24px; margin:0; letter-spacing:-0.5px;">SkillSync<span style="color:white;">AI</span></h1>
          </div>
          <div style="padding:32px;">
            <div style="text-align:center; margin-bottom:24px;">
              <div style="font-size:48px;">🎉</div>
              <h2 style="color:#111827; font-size:22px; font-weight:700; margin:12px 0 4px;">Congratulations, ${name}!</h2>
              <p style="color:#6b7280; font-size:15px; margin:0;">You've been shortlisted!</p>
            </div>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; margin-bottom:24px;">
              <p style="color:#15803d; font-size:14px; font-weight:600; margin:0 0 4px;">Position</p>
              <p style="color:#111827; font-size:18px; font-weight:700; margin:0;">${internshipTitle}</p>
              <p style="color:#6b7280; font-size:14px; margin:4px 0 0;">${company}</p>
            </div>
            <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 20px;">
              Great news! The employer has reviewed your application and shortlisted you for this role. 
              Log in to SkillSync AI to prepare for your interview using our AI Interview Prep tool.
            </p>
            <div style="text-align:center;">
              <a href="https://skill-sync-ai-sanjeev.vercel.app/student/dashboard" 
                 style="display:inline-block; background:#111827; color:white; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:600; font-size:14px;">
                Prepare for Interview →
              </a>
            </div>
          </div>
          <div style="border-top:1px solid #f3f4f6; padding:16px 32px; text-align:center;">
            <p style="color:#9ca3af; font-size:12px; margin:0;">SkillSync AI — Built by Sanjeev Vijesh</p>
          </div>
        </div>
      </body>
      </html>`
    );
  }
};

module.exports = emailService;