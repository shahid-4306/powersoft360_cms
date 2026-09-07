// // lib/email-service.ts
// import nodemailer from "nodemailer";

// // Gmail SMTP Configuration with Environment Variables
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

// export async function sendComplaintEmail(
//   to: string,
//   complaintNumber: string,
//   userName: string = "Customer",
//   companyName: string = "",
//   softwareType: string = "",
//   complaintRemarks: string = "",
// ) {
//   console.log("🚀 SENDING REAL EMAIL VIA GMAIL...");
//   console.log("From: PowerSoft360 <" + process.env.GMAIL_USER + ">");
//   console.log("To:", to);
//   console.log("Complaint:", complaintNumber);

//   try {
//     const mailOptions = {
//       from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
//       to: to,
//       subject: `Complaint Registered #${complaintNumber} - PowerSoft360`,
//       html: generateEmailTemplate(
//         complaintNumber,
//         userName,
//         companyName,
//         softwareType,
//         complaintRemarks,
//       ),
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log("✅ REAL EMAIL SENT SUCCESSFULLY!");
//     console.log("✅ Delivered to:", to);

//     return { success: true, data: info };
//   } catch (error) {
//     console.error("❌ Email delivery failed:", error);
//     return { success: false, error };
//   }
// }

// // ============================================================
// // Registration Email OTP Verification
// // ============================================================
// // Sends the one-time password used to verify a new registration's email
// // address. Kept as a separate function from sendComplaintEmail so the
// // existing complaint-notification flow is never touched.
// export async function sendRegistrationOtpEmail(
//   to: string,
//   otp: string,
//   fullName: string = "there",
// ) {
//   console.log("🚀 SENDING REGISTRATION OTP EMAIL...");
//   console.log("To:", to);

//   try {
//     const mailOptions = {
//       from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
//       to,
//       subject: `Your PowerSoft360 verification code: ${otp}`,
//       html: generateOtpEmailTemplate(otp, fullName),
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log("✅ OTP EMAIL SENT SUCCESSFULLY!");
//     return { success: true, data: info };
//   } catch (error) {
//     console.error("❌ OTP email delivery failed:", error);
//     return { success: false, error };
//   }
// }

// function generateOtpEmailTemplate(otp: string, fullName: string) {
//   const digits = otp.split("");
//   const currentYear = new Date().getFullYear();

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <style>
//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           margin: 0;
//           padding: 0;
//           background: #f5f5f5;
//         }
//         .container {
//           max-width: 600px;
//           margin: 0 auto;
//           background: white;
//         }
//         .header {
//           background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
//           color: white;
//           padding: 40px 30px;
//           text-align: center;
//         }
//         .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
//         .tagline { font-size: 16px; opacity: 0.9; }
//         .content { padding: 40px 30px; }
//         .otp-box {
//           display: flex;
//           justify-content: center;
//           gap: 10px;
//           margin: 30px 0;
//         }
//         .otp-digit {
//           width: 44px;
//           height: 54px;
//           line-height: 54px;
//           text-align: center;
//           font-size: 26px;
//           font-weight: 700;
//           color: #1e293b;
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//         }
//         .expiry-note {
//           background: #fef3c7;
//           border: 1px solid #f59e0b;
//           border-radius: 8px;
//           padding: 16px 20px;
//           margin: 25px 0;
//           color: #92400e;
//           font-size: 14px;
//           text-align: center;
//         }
//         .security-note {
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           padding: 20px;
//           margin: 25px 0;
//           font-size: 13px;
//           color: #64748b;
//         }
//         .footer {
//           background: #1e293b;
//           color: #cbd5e1;
//           padding: 30px;
//           text-align: center;
//           font-size: 14px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <div class="logo">PowerSoft360</div>
//           <div class="tagline">Your Complete Software Solution Partner</div>
//         </div>
//         <div class="content">
//           <h2 style="color: #1e293b; margin-bottom: 5px;">Hi ${fullName},</h2>
//           <p style="color: #64748b; font-size: 16px; margin-top: 0;">
//             Use the verification code below to confirm your email address and complete your PowerSoft360 registration.
//           </p>

//           <div class="otp-box">
//             ${digits.map((d) => `<div class="otp-digit">${d}</div>`).join("")}
//           </div>

//           <div class="expiry-note">
//             ⏳ This code expires in <strong>5 minutes</strong>. If it expires, you can request a new one from the registration page.
//           </div>

//           <div class="security-note">
//             🔒 <strong>Security tip:</strong> Never share this code with anyone, including PowerSoft360 staff.
//             If you didn't request this code, you can safely ignore this email — your registration will not be
//             completed without it.
//           </div>
//         </div>
//         <div class="footer">
//           <div style="margin-bottom: 20px;">
//             <strong style="color: white; font-size: 18px;">PowerSoft360</strong>
//           </div>
//           <p>
//             Complete Business Solutions • Financial Software • POS Systems<br>
//             Custom Development • Support &amp; Maintenance
//           </p>
//           <p style="margin-top: 20px; color: #94a3b8;">
//             © ${currentYear} PowerSoft360. All rights reserved.<br>
//             This is an automated message. Please do not reply to this email.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }

// function generateEmailTemplate(
//   complaintNumber: string,
//   userName: string,
//   companyName: string,
//   softwareType: string,
//   complaintRemarks: string,
// ) {
//   const shortRemarks =
//     complaintRemarks.length > 100
//       ? complaintRemarks.substring(0, 100) + "..."
//       : complaintRemarks;

//   const currentYear = new Date().getFullYear();

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <style>
//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           margin: 0;
//           padding: 0;
//           background: #f5f5f5;
//         }
//         .container {
//           max-width: 600px;
//           margin: 0 auto;
//           background: white;
//         }
//         .header {
//           background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
//           color: white;
//           padding: 40px 30px;
//           text-align: center;
//         }
//         .logo {
//           font-size: 28px;
//           font-weight: bold;
//           margin-bottom: 10px;
//         }
//         .tagline {
//           font-size: 16px;
//           opacity: 0.9;
//         }
//         .content {
//           padding: 40px 30px;
//         }
//         .complaint-number {
//           background: linear-gradient(135deg, #059669 0%, #10b981 100%);
//           color: white;
//           padding: 25px;
//           text-align: center;
//           font-size: 26px;
//           font-weight: bold;
//           margin: 30px 0;
//           border-radius: 10px;
//           box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
//         }
//         .details-box {
//           background: #f8fafc;
//           border: 1px solid #e2e8f0;
//           border-radius: 8px;
//           padding: 20px;
//           margin: 25px 0;
//         }
//         .detail-item {
//           margin: 10px 0;
//           display: flex;
//         }
//         .detail-label {
//           font-weight: 600;
//           color: #475569;
//           min-width: 120px;
//         }
//         .detail-value {
//           color: #1e293b;
//           flex: 1;
//         }
//         .status-timeline {
//           background: #dbeafe;
//           border-left: 4px solid #2563eb;
//           padding: 20px;
//           margin: 25px 0;
//           border-radius: 0 8px 8px 0;
//         }
//         .timeline-item {
//           display: flex;
//           align-items: center;
//           margin: 12px 0;
//         }
//         .timeline-dot {
//           width: 12px;
//           height: 12px;
//           background: #2563eb;
//           border-radius: 50%;
//           margin-right: 15px;
//         }
//         .action-button {
//           display: inline-block;
//           background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
//           color: white;
//           padding: 14px 32px;
//           text-decoration: none;
//           border-radius: 8px;
//           margin: 20px 0;
//           font-weight: 600;
//           font-size: 16px;
//           text-align: center;
//           box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
//         }
//         .support-section {
//           background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
//           border: 1px solid #f59e0b;
//           border-radius: 8px;
//           padding: 25px;
//           margin: 30px 0;
//         }
//         .footer {
//           background: #1e293b;
//           color: #cbd5e1;
//           padding: 30px;
//           text-align: center;
//           font-size: 14px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <!-- Header -->
//         <div class="header">
//           <div class="logo">PowerSoft360</div>
//           <div class="tagline">Your Complete Software Solution Partner</div>
//         </div>

//         <!-- Content -->
//         <div class="content">
//           <h2 style="color: #1e293b; margin-bottom: 5px;">Dear ${userName},</h2>
//           <p style="color: #64748b; font-size: 16px; margin-top: 0;">
//             Thank you for choosing PowerSoft360. Your complaint has been successfully registered in our system.
//           </p>

//           <!-- Complaint Number -->
//           <div class="complaint-number">
//             🎯 Complaint Reference: ${complaintNumber}
//           </div>

//           <!-- Complaint Details -->
//           <div class="details-box">
//             <h3 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
//               Complaint Details
//             </h3>
//             ${
//               companyName
//                 ? `
//             <div class="detail-item">
//               <span class="detail-label">Company:</span>
//               <span class="detail-value">${companyName}</span>
//             </div>
//             `
//                 : ""
//             }
//             ${
//               softwareType
//                 ? `
//             <div class="detail-item">
//               <span class="detail-label">Software:</span>
//               <span class="detail-value">${softwareType}</span>
//             </div>
//             `
//                 : ""
//             }
//             <div class="detail-item">
//               <span class="detail-label">Description:</span>
//               <span class="detail-value">"${shortRemarks}"</span>
//             </div>
//             <div class="detail-item">
//               <span class="detail-label">Status:</span>
//               <span class="detail-value" style="color: #059669; font-weight: 600;">✅ Registered &amp; In Queue</span>
//             </div>
//           </div>

//           <!-- Status Timeline -->
//           <div class="status-timeline">
//             <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
//             <div class="timeline-item">
//               <div class="timeline-dot"></div>
//               <div style="flex: 1;">
//                 <strong>Step 1:</strong> Technical team assignment (Within 2 hours)
//               </div>
//             </div>
//             <div class="timeline-item">
//               <div class="timeline-dot"></div>
//               <div style="flex: 1;">
//                 <strong>Step 2:</strong> Initial analysis and contact (Within 24 hours)
//               </div>
//             </div>
//             <div class="timeline-item">
//               <div class="timeline-dot"></div>
//               <div style="flex: 1;">
//                 <strong>Step 3:</strong> Resolution progress updates
//               </div>
//             </div>
//           </div>

//           <!-- Action Button -->
//           <div style="text-align: center;">
//             <a href="${process.env.NEXTAUTH_URL}/complaint_status" class="action-button">
//               🔍 Track Complaint Status
//             </a>
//           </div>

//           <!-- Support Section -->
//           <div class="support-section">
//             <h3 style="color: #92400e; margin-top: 0;">📞 Need Immediate Assistance?</h3>
//             <div style="color: #92400e;">
//               <p><strong>Hotline:</strong> +92 321 643 9416</p>
//               <p><strong>Email:</strong> support@powersoft360.com</p>
//               <p><strong>Hours:</strong> 9:00 AM - 6:00 PM (SAT - THR)</p>
//             </div>
//           </div>
//         </div>

//         <!-- Footer -->
//         <div class="footer">
//           <div style="margin-bottom: 20px;">
//             <strong style="color: white; font-size: 18px;">PowerSoft360</strong>
//           </div>
//           <p>
//             Complete Business Solutions • Financial Software • POS Systems<br>
//             Custom Development • Support & Maintenance
//           </p>
//           <p style="margin-top: 20px; color: #94a3b8;">
//             © ${currentYear} PowerSoft360. All rights reserved.<br>
//             This is an automated message. Please do not reply to this email.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }

// function generateTextTemplate(
//   complaintNumber: string,
//   userName: string,
//   companyName: string,
//   softwareType: string,
//   complaintRemarks: string,
// ) {
//   const currentYear = new Date().getFullYear();

//   return `
// PowerSoft360 - Complaint Registration Confirmation

// Dear ${userName},

// Your complaint has been successfully registered with PowerSoft360.

// COMPLAINT REFERENCE: ${complaintNumber}

// Complaint Details:
// ${companyName ? `Company: ${companyName}` : ""}
// ${softwareType ? `Software: ${softwareType}` : ""}
// Description: ${complaintRemarks}
// Status: Registered & In Queue

// What's Next?
// 1. Technical team assignment (Within 2 hours)
// 2. Initial analysis and contact (Within 24 hours)
// 3. Resolution progress updates

// Track your complaint status here:
// ${process.env.NEXTAUTH_URL}/complaint_status

// Need Immediate Assistance?
// Hotline: +92 300 123 4567
// Email: support@powersoft360.com
// Hours: 9:00 AM - 6:00 PM (Mon - Sat)

// Thank you for choosing PowerSoft360.

// --
// PowerSoft360
// Complete Business Solutions
// © ${currentYear} PowerSoft360. All rights reserved.
//   `;
// }

// lib/email-service.ts
import nodemailer from "nodemailer";

// Gmail SMTP Configuration with Environment Variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendComplaintEmail(
  to: string,
  complaintNumber: string,
  userName: string = "Customer",
  companyName: string = "",
  softwareType: string = "",
  complaintRemarks: string = "",
) {
  console.log("🚀 SENDING REAL EMAIL VIA GMAIL...");
  console.log("From: PowerSoft360 <" + process.env.GMAIL_USER + ">");
  console.log("To:", to);
  console.log("Complaint:", complaintNumber);

  try {
    const mailOptions = {
      from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Complaint Registered #${complaintNumber} - PowerSoft360`,
      html: generateEmailTemplate(
        complaintNumber,
        userName,
        companyName,
        softwareType,
        complaintRemarks,
      ),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ REAL EMAIL SENT SUCCESSFULLY!");
    console.log("✅ Delivered to:", to);

    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Email delivery failed:", error);
    return { success: false, error };
  }
}

// ============================================================
// Registration Email OTP Verification
// ============================================================
// Sends the one-time password used to verify a new registration's email
// address. Kept as a separate function from sendComplaintEmail so the
// existing complaint-notification flow is never touched.
export async function sendRegistrationOtpEmail(
  to: string,
  otp: string,
  fullName: string = "there",
) {
  console.log("🚀 SENDING REGISTRATION OTP EMAIL...");
  console.log("To:", to);

  try {
    const mailOptions = {
      from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
      to,
      subject: `Your PowerSoft360 verification code: ${otp}`,
      html: generateOtpEmailTemplate(otp, fullName),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP EMAIL SENT SUCCESSFULLY!");
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ OTP email delivery failed:", error);
    return { success: false, error };
  }
}

// ============================================================
// Complaint Rejected Notification
// ============================================================
// Sent to the exact email address the complaint was submitted with
// (never a hardcoded/static address) when an Administrator rejects an
// incomplete/invalid complaint from the Task & Complaint Assignment
// screen. Includes the mandatory rejection reason/remarks so the
// customer knows what to correct.
export async function sendComplaintRejectionEmail(
  to: string,
  complaintNumber: string,
  userName: string = "Customer",
  remarks: string = "",
) {
  console.log("🚀 SENDING COMPLAINT REJECTION EMAIL...");
  console.log("To:", to);
  console.log("Complaint:", complaintNumber);

  try {
    const mailOptions = {
      from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
      to,
      subject: `Complaint #${complaintNumber} Could Not Be Processed - PowerSoft360`,
      html: generateRejectionEmailTemplate(complaintNumber, userName, remarks),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ REJECTION EMAIL SENT SUCCESSFULLY!");
    console.log("✅ Delivered to:", to);

    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Rejection email delivery failed:", error);
    return { success: false, error };
  }
}

// ============================================================
// Complaint Assigned Notification
// ============================================================
// Sent to the exact email address the complaint was submitted with
// (never a hardcoded/static address) when an Administrator assigns the
// complaint to a support team member, so the customer knows their
// complaint is actively being worked on.
export async function sendComplaintAssignmentEmail(
  to: string,
  complaintNumber: string,
  userName: string = "Customer",
  assignedToName: string = "our support team",
  remarks: string = "",
) {
  console.log("🚀 SENDING COMPLAINT ASSIGNMENT EMAIL...");
  console.log("To:", to);
  console.log("Complaint:", complaintNumber);

  try {
    const mailOptions = {
      from: `PowerSoft360 <${process.env.GMAIL_USER}>`,
      to,
      subject: `Complaint #${complaintNumber} Is Now In Progress - PowerSoft360`,
      html: generateAssignmentEmailTemplate(
        complaintNumber,
        userName,
        assignedToName,
        remarks,
      ),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ ASSIGNMENT EMAIL SENT SUCCESSFULLY!");
    console.log("✅ Delivered to:", to);

    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Assignment email delivery failed:", error);
    return { success: false, error };
  }
}

function generateRejectionEmailTemplate(
  complaintNumber: string,
  userName: string,
  remarks: string,
) {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .complaint-number { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; padding: 18px; text-align: center; font-size: 20px; font-weight: bold; margin: 25px 0; border-radius: 10px; }
        .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; color: #991b1b; }
        .support-section { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PowerSoft360</div>
          <div class="tagline">Your Complete Software Solution Partner</div>
        </div>
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 5px;">Dear ${userName},</h2>
          <p style="color: #64748b; font-size: 16px; margin-top: 0;">
            We reviewed your complaint below, but we were unable to proceed with it as submitted.
          </p>
          <div class="complaint-number">Complaint Reference: ${complaintNumber}</div>
          <div class="reason-box">
            <strong>Reason for rejection:</strong>
            <p style="margin: 8px 0 0 0;">${remarks}</p>
          </div>
          <p style="color: #64748b;">
            Please review the reason above and submit a new complaint once the issue has been corrected.
            If you believe this was a mistake, contact our support team using the details below.
          </p>
          <div class="support-section">
            <h3 style="color: #92400e; margin-top: 0;">📞 Need Assistance?</h3>
            <div style="color: #92400e;">
              <p><strong>Hotline:</strong> +92 321 643 9416</p>
              <p><strong>Email:</strong> support@powersoft360.com</p>
              <p><strong>Hours:</strong> 9:00 AM - 6:00 PM (SAT - THR)</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <div style="margin-bottom: 20px;"><strong style="color: white; font-size: 18px;">PowerSoft360</strong></div>
          <p>Complete Business Solutions • Financial Software • POS Systems<br>Custom Development • Support &amp; Maintenance</p>
          <p style="margin-top: 20px; color: #94a3b8;">© ${currentYear} PowerSoft360. All rights reserved.<br>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAssignmentEmailTemplate(
  complaintNumber: string,
  userName: string,
  assignedToName: string,
  remarks: string,
) {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .complaint-number { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold; margin: 25px 0; border-radius: 10px; }
        .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .action-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; font-size: 16px; text-align: center; }
        .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PowerSoft360</div>
          <div class="tagline">Your Complete Software Solution Partner</div>
        </div>
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 5px;">Dear ${userName},</h2>
          <p style="color: #64748b; font-size: 16px; margin-top: 0;">
            Good news — your complaint is now being actively worked on by our team.
          </p>
          <div class="complaint-number">✅ Complaint ${complaintNumber} is In Progress</div>
          <div class="details-box">
            <p style="margin: 6px 0;"><strong>Assigned to:</strong> ${assignedToName}</p>
            ${remarks ? `<p style="margin: 6px 0;"><strong>Note:</strong> ${remarks}</p>` : ""}
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/complaint_status" class="action-button">🔍 Track Complaint Status</a>
          </div>
        </div>
        <div class="footer">
          <div style="margin-bottom: 20px;"><strong style="color: white; font-size: 18px;">PowerSoft360</strong></div>
          <p>Complete Business Solutions • Financial Software • POS Systems<br>Custom Development • Support &amp; Maintenance</p>
          <p style="margin-top: 20px; color: #94a3b8;">© ${currentYear} PowerSoft360. All rights reserved.<br>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOtpEmailTemplate(otp: string, fullName: string) {
  const digits = otp.split("");
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .otp-box {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin: 30px 0;
        }
        .otp-digit {
          width: 44px;
          height: 54px;
          line-height: 54px;
          text-align: center;
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .expiry-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px 20px;
          margin: 25px 0;
          color: #92400e;
          font-size: 14px;
          text-align: center;
        }
        .security-note {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          font-size: 13px;
          color: #64748b;
        }
        .footer {
          background: #1e293b;
          color: #cbd5e1;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PowerSoft360</div>
          <div class="tagline">Your Complete Software Solution Partner</div>
        </div>
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 5px;">Hi ${fullName},</h2>
          <p style="color: #64748b; font-size: 16px; margin-top: 0;">
            Use the verification code below to confirm your email address and complete your PowerSoft360 registration.
          </p>

          <div class="otp-box">
            ${digits.map((d) => `<div class="otp-digit">${d}</div>`).join("")}
          </div>

          <div class="expiry-note">
            ⏳ This code expires in <strong>5 minutes</strong>. If it expires, you can request a new one from the registration page.
          </div>

          <div class="security-note">
            🔒 <strong>Security tip:</strong> Never share this code with anyone, including PowerSoft360 staff.
            If you didn't request this code, you can safely ignore this email — your registration will not be
            completed without it.
          </div>
        </div>
        <div class="footer">
          <div style="margin-bottom: 20px;">
            <strong style="color: white; font-size: 18px;">PowerSoft360</strong>
          </div>
          <p>
            Complete Business Solutions • Financial Software • POS Systems<br>
            Custom Development • Support &amp; Maintenance
          </p>
          <p style="margin-top: 20px; color: #94a3b8;">
            © ${currentYear} PowerSoft360. All rights reserved.<br>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailTemplate(
  complaintNumber: string,
  userName: string,
  companyName: string,
  softwareType: string,
  complaintRemarks: string,
) {
  const shortRemarks =
    complaintRemarks.length > 100
      ? complaintRemarks.substring(0, 100) + "..."
      : complaintRemarks;

  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .tagline {
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .complaint-number {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 25px;
          text-align: center;
          font-size: 26px;
          font-weight: bold;
          margin: 30px 0;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }
        .details-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .detail-item {
          margin: 10px 0;
          display: flex;
        }
        .detail-label {
          font-weight: 600;
          color: #475569;
          min-width: 120px;
        }
        .detail-value {
          color: #1e293b;
          flex: 1;
        }
        .status-timeline {
          background: #dbeafe;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 25px 0;
          border-radius: 0 8px 8px 0;
        }
        .timeline-item {
          display: flex;
          align-items: center;
          margin: 12px 0;
        }
        .timeline-dot {
          width: 12px;
          height: 12px;
          background: #2563eb;
          border-radius: 50%;
          margin-right: 15px;
        }
        .action-button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }
        .support-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
        }
        .footer {
          background: #1e293b;
          color: #cbd5e1;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">PowerSoft360</div>
          <div class="tagline">Your Complete Software Solution Partner</div>
        </div>

        <!-- Content -->
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 5px;">Dear ${userName},</h2>
          <p style="color: #64748b; font-size: 16px; margin-top: 0;">
            Thank you for choosing PowerSoft360. Your complaint has been successfully registered in our system.
          </p>

          <!-- Complaint Number -->
          <div class="complaint-number">
            🎯 Complaint Reference: ${complaintNumber}
          </div>

          <!-- Complaint Details -->
          <div class="details-box">
            <h3 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
              Complaint Details
            </h3>
            ${
              companyName
                ? `
            <div class="detail-item">
              <span class="detail-label">Company:</span>
              <span class="detail-value">${companyName}</span>
            </div>
            `
                : ""
            }
            ${
              softwareType
                ? `
            <div class="detail-item">
              <span class="detail-label">Software:</span>
              <span class="detail-value">${softwareType}</span>
            </div>
            `
                : ""
            }
            <div class="detail-item">
              <span class="detail-label">Description:</span>
              <span class="detail-value">"${shortRemarks}"</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value" style="color: #059669; font-weight: 600;">✅ Registered &amp; In Queue</span>
            </div>
          </div>

          <!-- Status Timeline -->
          <div class="status-timeline">
            <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div style="flex: 1;">
                <strong>Step 1:</strong> Technical team assignment (Within 2 hours)
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div style="flex: 1;">
                <strong>Step 2:</strong> Initial analysis and contact (Within 24 hours)
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div style="flex: 1;">
                <strong>Step 3:</strong> Resolution progress updates
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/complaint_status" class="action-button">
              🔍 Track Complaint Status
            </a>
          </div>

          <!-- Support Section -->
          <div class="support-section">
            <h3 style="color: #92400e; margin-top: 0;">📞 Need Immediate Assistance?</h3>
            <div style="color: #92400e;">
              <p><strong>Hotline:</strong> +92 321 643 9416</p>
              <p><strong>Email:</strong> support@powersoft360.com</p>
              <p><strong>Hours:</strong> 9:00 AM - 6:00 PM (SAT - THR)</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="margin-bottom: 20px;">
            <strong style="color: white; font-size: 18px;">PowerSoft360</strong>
          </div>
          <p>
            Complete Business Solutions • Financial Software • POS Systems<br>
            Custom Development • Support & Maintenance
          </p>
          <p style="margin-top: 20px; color: #94a3b8;">
            © ${currentYear} PowerSoft360. All rights reserved.<br>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTextTemplate(
  complaintNumber: string,
  userName: string,
  companyName: string,
  softwareType: string,
  complaintRemarks: string,
) {
  const currentYear = new Date().getFullYear();

  return `
PowerSoft360 - Complaint Registration Confirmation

Dear ${userName},

Your complaint has been successfully registered with PowerSoft360.

COMPLAINT REFERENCE: ${complaintNumber}

Complaint Details:
${companyName ? `Company: ${companyName}` : ""}
${softwareType ? `Software: ${softwareType}` : ""}
Description: ${complaintRemarks}
Status: Registered & In Queue

What's Next?
1. Technical team assignment (Within 2 hours)
2. Initial analysis and contact (Within 24 hours)
3. Resolution progress updates

Track your complaint status here:
${process.env.NEXTAUTH_URL}/complaint_status

Need Immediate Assistance?
Hotline: +92 300 123 4567
Email: support@powersoft360.com
Hours: 9:00 AM - 6:00 PM (Mon - Sat)

Thank you for choosing PowerSoft360.

--
PowerSoft360
Complete Business Solutions
© ${currentYear} PowerSoft360. All rights reserved.
  `;
}
