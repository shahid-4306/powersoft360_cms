import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import { isValidActiveSoftwareType } from "@/lib/softwareTypes";
// NOTE: notifyRegistrationSubmitted is intentionally NOT fired here anymore.
// It now fires from /api/register/verify-otp once the applicant proves
// ownership of their email address, so admins only ever see verified
// registrations in their queue (see app/api/admin/registrations/route.ts).
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendRegistrationOtpEmail } from "@/lib/email-service";

// companyName / softwareType are submitted as a single comma-separated
// string when the user selects multiple companies / software types on
// the registration form. Split + trim + de-dupe into a clean list.
function splitMultiValue(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  );
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, matches the client-side limit

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { message: "Invalid form submission" },
        { status: 400 },
      );
    }

    const fullName = (formData.get("fullName") as string || "").trim();
    const phoneNumber = (formData.get("phoneNumber") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const companyName = (formData.get("companyName") as string || "").trim();
    const softwareType = (formData.get("softwareType") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const profileImageFile = formData.get("profileImage") as File | null;

    // ============================
    // Validation
    // ============================
    const errors: Record<string, string> = {};

    if (!fullName || fullName.length < 2 || fullName.length > 50) {
      errors.fullName = "Full name must be between 2 and 50 characters";
    }
    if (!phoneNumber || phoneNumber.length < 7) {
      errors.phoneNumber = "A valid phone number is required";
    }
    if (!email || !isValidEmail(email)) {
      errors.email = "A valid email address is required";
    }
    // No password field: customer sessions are passwordless (see
    // lib/customer-auth.ts) — access is granted via email verification
    // once an admin approves the registration.

    const companyNames = companyName ? splitMultiValue(companyName) : [];
    if (companyNames.length === 0 || companyNames.some((c) => c.length < 2)) {
      errors.companyName = "Please select at least one company";
    }

    const softwareTypes = softwareType ? splitMultiValue(softwareType) : [];
    if (softwareTypes.length === 0) {
      errors.softwareType = "Please select at least one software type";
    } else {
      const validityChecks = await Promise.all(
        softwareTypes.map((type) => isValidActiveSoftwareType(type)),
      );
      if (validityChecks.some((isValid) => !isValid)) {
        errors.softwareType = "Please select valid software types";
      }
    }

    if (description && description.length > 500) {
      errors.description = "Description must not exceed 500 characters";
    }

    let profileImageDataUrl: string | null = null;
    if (profileImageFile && profileImageFile.size > 0) {
      if (!profileImageFile.type?.startsWith("image/")) {
        errors.profileImage = "Please upload a valid image file";
      } else if (profileImageFile.size > MAX_IMAGE_SIZE) {
        errors.profileImage = "Image must be under 5MB";
      } else {
        const buffer = Buffer.from(await profileImageFile.arrayBuffer());
        profileImageDataUrl = `data:${profileImageFile.type};base64,${buffer.toString("base64")}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields", errors },
        { status: 400 },
      );
    }

    // ============================
    // Duplicate check
    // ============================
    const existing = await UserRegister.findOne({ email });
    if (existing) {
      // If a previous attempt never completed email verification, treat
      // this submission as "try again" — update the same record with fresh
      // details and issue a brand-new OTP, instead of hard-blocking the
      // user. Any already-verified (or admin-reviewed) record still blocks
      // duplicate registration as before.
      if (!existing.isEmailVerified) {
        existing.fullName = fullName;
        existing.phoneNumber = phoneNumber;
        existing.companyName = companyNames.join(", ");
        existing.softwareType = softwareTypes.join(", ");
        existing.description = description;
        if (profileImageDataUrl) existing.profileImage = profileImageDataUrl;

        const otp = generateOtp();
        existing.emailOtpHash = await hashOtp(otp);
        existing.emailOtpExpiresAt = otpExpiryDate();
        existing.emailOtpAttempts = 0;
        existing.emailOtpLastSentAt = new Date();
        await existing.save();

        const emailResult = await sendRegistrationOtpEmail(email, otp, fullName);
        if (!emailResult.success) {
          console.error("⚠️ Re-registration OTP email failed to send:", email);
        }

        return NextResponse.json(
          {
            message:
              "We've sent a new 6-digit verification code to your email. Enter it to confirm your address.",
            registrationId: existing._id.toString(),
            email,
            requiresOtp: true,
            otpExpiresInSeconds: 5 * 60,
          },
          { status: 201 },
        );
      }

      return NextResponse.json(
        {
          message:
            "An account with this email already exists. If you already registered, please wait for admin approval or contact support.",
        },
        { status: 409 },
      );
    }

    // ============================
    // Save
    // ============================
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    const registration = await UserRegister.create({
      fullName,
      phoneNumber,
      email,
      companyName: companyNames.join(", "),
      softwareType: softwareTypes.join(", "),
      description,
      profileImage: profileImageDataUrl,
      status: "pending",
      isEmailVerified: false,
      emailOtpHash: otpHash,
      emailOtpExpiresAt: otpExpiryDate(),
      emailOtpAttempts: 0,
      emailOtpLastSentAt: new Date(),
    });

    // ============================
    // Send OTP verification email
    // ============================
    const emailResult = await sendRegistrationOtpEmail(email, otp, fullName);

    if (!emailResult.success) {
      // The registration record exists but the OTP email failed to send.
      // Don't fail the whole request — the applicant can use "Resend OTP"
      // from the verification screen to retry delivery.
      console.error("⚠️ Registration created but OTP email failed to send:", email);
    }

    return NextResponse.json(
      {
        message:
          "We've sent a 6-digit verification code to your email. Enter it to confirm your address — your account stays pending until it's verified.",
        registrationId: registration._id.toString(),
        email,
        requiresOtp: true,
        otpExpiresInSeconds: 5 * 60,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Registration error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        { message: error.message || "Invalid registration data" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Registration failed. Please try again later." },
      { status: 500 },
    );
  }
}
