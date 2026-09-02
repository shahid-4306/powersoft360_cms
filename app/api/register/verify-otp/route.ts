import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import { notifyRegistrationSubmitted } from "@/lib/notification-events";
import { compareOtp, isOtpExpired, isValidOtpFormat, OTP_MAX_ATTEMPTS } from "@/lib/otp";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ======================================================
// POST → Verify the 6-digit OTP for a pending registration.
// On success: marks the registration email-verified and hands it off
// to the existing admin-approval queue (unchanged downstream behavior).
// ======================================================
export async function POST(request: Request) {
  try {
    await dbConnect();

    let body: { email?: string; otp?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const email = (body.email || "").trim().toLowerCase();
    const otp = (body.otp || "").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "A valid email address is required" }, { status: 400 });
    }
    if (!isValidOtpFormat(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code exactly as received" }, { status: 400 });
    }

    const registration = await UserRegister.findOne({ email }).select(
      "+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts",
    );

    if (!registration) {
      return NextResponse.json(
        { message: "No registration found for this email. Please register again." },
        { status: 404 },
      );
    }

    if (registration.isEmailVerified) {
      return NextResponse.json(
        { message: "This email is already verified. Your registration is pending admin review.", alreadyVerified: true },
        { status: 200 },
      );
    }

    if (!registration.emailOtpHash) {
      return NextResponse.json(
        { message: "No active verification code. Please request a new one." },
        { status: 400 },
      );
    }

    if (registration.emailOtpAttempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Too many incorrect attempts. Please request a new verification code." },
        { status: 429 },
      );
    }

    if (isOtpExpired(registration.emailOtpExpiresAt)) {
      return NextResponse.json(
        { message: "This code has expired. Please request a new verification code.", expired: true },
        { status: 410 },
      );
    }

    const isMatch = await compareOtp(otp, registration.emailOtpHash);

    if (!isMatch) {
      registration.emailOtpAttempts = (registration.emailOtpAttempts || 0) + 1;
      await registration.save();

      const remaining = Math.max(0, OTP_MAX_ATTEMPTS - registration.emailOtpAttempts);
      return NextResponse.json(
        {
          message:
            remaining > 0
              ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
              : "Incorrect verification code. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // ✅ Success — activate email verification, clear OTP state.
    registration.isEmailVerified = true;
    registration.emailVerifiedAt = new Date();
    registration.emailOtpHash = null;
    registration.emailOtpExpiresAt = null;
    registration.emailOtpAttempts = 0;
    await registration.save();

    // Hand off to the existing admin-approval workflow, unchanged.
    // Awaited so the notification write completes before the response is
    // sent (fire-and-forget calls can be dropped once a serverless
    // function returns). notify() swallows its own errors internally, so
    // this can never fail the OTP verification itself.
    await notifyRegistrationSubmitted({
      registrationId: registration._id.toString(),
      applicantName: registration.fullName,
      applicantEmail: registration.email,
      registeredAt: registration.createdAt,
    });

    return NextResponse.json(
      {
        message:
          "Email verified successfully! Your registration is now pending admin approval — you'll be notified once it's reviewed.",
        verified: true,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ OTP verification error:", error);
    return NextResponse.json(
      { message: "Verification failed. Please try again later." },
      { status: 500 },
    );
  }
}
