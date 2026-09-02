import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import { sendRegistrationOtpEmail } from "@/lib/email-service";
import { generateOtp, hashOtp, otpExpiryDate, OTP_RESEND_COOLDOWN_MS } from "@/lib/otp";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ======================================================
// POST → Resend a fresh OTP for a pending, unverified registration.
// Invalidates any previously issued OTP immediately (overwritten below)
// and enforces a short cooldown to prevent spamming the mailbox.
// ======================================================
export async function POST(request: Request) {
  try {
    await dbConnect();

    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const email = (body.email || "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "A valid email address is required" }, { status: 400 });
    }

    const registration = await UserRegister.findOne({ email }).select(
      "+emailOtpLastSentAt +emailOtpHash +emailOtpExpiresAt +emailOtpAttempts",
    );

    if (!registration) {
      return NextResponse.json(
        { message: "No registration found for this email. Please register again." },
        { status: 404 },
      );
    }

    if (registration.isEmailVerified) {
      return NextResponse.json(
        { message: "This email is already verified.", alreadyVerified: true },
        { status: 200 },
      );
    }

    const lastSent = registration.emailOtpLastSentAt;
    if (lastSent) {
      const elapsed = Date.now() - new Date(lastSent).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const waitMs = OTP_RESEND_COOLDOWN_MS - elapsed;
        return NextResponse.json(
          {
            message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`,
            retryAfterMs: waitMs,
          },
          { status: 429 },
        );
      }
    }

    // Invalidate the previous OTP and issue a new one.
    const otp = generateOtp();
    registration.emailOtpHash = await hashOtp(otp);
    registration.emailOtpExpiresAt = otpExpiryDate();
    registration.emailOtpAttempts = 0;
    registration.emailOtpLastSentAt = new Date();
    await registration.save();

    const emailResult = await sendRegistrationOtpEmail(email, otp, registration.fullName);
    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again shortly." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        message: "A new verification code has been sent to your email.",
        otpExpiresInSeconds: 5 * 60,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Resend OTP error:", error);
    return NextResponse.json(
      { message: "Failed to resend verification code. Please try again later." },
      { status: 500 },
    );
  }
}
