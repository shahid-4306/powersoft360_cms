// lib/admin-email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Email for APPROVED users — no password needed. The complaint module is
// accessed by simply re-entering this email address on the verification page.
export async function sendApprovalEmail(
  to: string,
  userName: string,
  email: string,
) {
  console.log("📧 Sending APPROVAL email to:", to);

  try {
    const mailOptions = {
      from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
      to: to,
      subject: "✅ Registration Approved - PowerSoft360",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .success-badge { background: #d1fae5; border: 1px solid #059669; border-radius: 10px; padding: 25px; margin: 25px 0; text-align: center; }
            .credentials-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0; }
            .credential-item { display: flex; align-items: center; padding: 12px; background: white; border-radius: 6px; margin: 10px 0; border: 1px solid #e2e8f0; }
            .credential-label { font-weight: 600; color: #475569; min-width: 100px; }
            .credential-value { color: #1e293b; font-family: 'Courier New', monospace; font-size: 16px; }
            .login-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; text-align: center; }
            .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Registration Approved!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to PowerSoft360 Family</p>
            </div>
            <div class="content">
              <h2>Dear ${userName},</h2>
              <p>Great news! Your registration with <strong>PowerSoft360</strong> has been <strong style="color: #059669;">approved</strong> by our admin team.</p>

              <div class="success-badge">
                <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                <h3 style="color: #059669; margin: 0;">Your Account is Ready!</h3>
                <p style="color: #64748b;">You can now access the Complaint module — no password required.</p>
              </div>

              <div class="credentials-box">
                <h3 style="color: #1e293b; margin-top: 0;">📧 How to Access the Complaint Module</h3>
                <div class="credential-item">
                  <span class="credential-label">Your Email:</span>
                  <span class="credential-value">${email}</span>
                </div>
                <p style="color: #475569; font-size: 14px; margin-top: 15px;">
                  Simply click "Complaint Register" on our website, then enter the email
                  address above on the verification page to continue.
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/verify-email" class="login-button">
                  📨 Go to Complaint Module
                </a>
              </div>
            </div>
            <div class="footer">
              <p><strong style="color: white;">PowerSoft360</strong></p>
              <p>Complete Business Solutions • Support & Maintenance</p>
              <p style="color: #94a3b8;">© ${new Date().getFullYear()} PowerSoft360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Approval email sent to:", to);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Approval email failed:", error);
    return { success: false, error };
  }
}

// Email for REJECTED users
export async function sendRejectionEmail(
  to: string,
  userName: string,
  reason: string = "Your registration does not meet our current requirements.",
) {
  console.log("📧 Sending REJECTION email to:", to);

  try {
    const mailOptions = {
      from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
      to: to,
      subject: "❌ Registration Status Update - PowerSoft360",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .rejection-box { background: #fef2f2; border: 1px solid #dc2626; border-radius: 10px; padding: 25px; margin: 25px 0; }
            .reason-box { background: #fff7ed; border: 1px solid #f97316; border-left: 4px solid #f97316; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .contact-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Registration Update</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Important notification regarding your application</p>
            </div>
            <div class="content">
              <h2>Dear ${userName},</h2>
              <p>Thank you for your interest in <strong>PowerSoft360</strong>. We have reviewed your registration application.</p>

              <div class="rejection-box">
                <div style="font-size: 48px; margin-bottom: 10px; text-align: center;">😔</div>
                <h3 style="color: #dc2626; text-align: center; margin: 0;">Registration Not Approved</h3>
                <p style="color: #64748b; text-align: center;">We are unable to approve your registration at this time.</p>
              </div>

              <div class="reason-box">
                <h3 style="color: #9a3412; margin-top: 0;">📋 Reason:</h3>
                <p style="color: #431407;">${reason}</p>
              </div>

              <div style="text-align: center;">
                <p style="color: #64748b;">If you have any questions or would like to discuss this further, please don't hesitate to contact us.</p>
                <a href="mailto:support@powersoft360.com" class="contact-button">
                  📧 Contact Support Team
                </a>
              </div>
            </div>
            <div class="footer">
              <p><strong style="color: white;">PowerSoft360</strong></p>
              <p>Complete Business Solutions • Support & Maintenance</p>
              <p style="color: #94a3b8;">© ${new Date().getFullYear()} PowerSoft360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Rejection email sent to:", to);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Rejection email failed:", error);
    return { success: false, error };
  }
}
