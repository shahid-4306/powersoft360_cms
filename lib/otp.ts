// lib/otp.ts
//
// Small, self-contained helper for generating and validating email
// verification OTPs used by the registration flow. Kept isolated from
// lib/auth.ts / lib/customer-auth.ts (admin & customer session concerns) —
// this module has no knowledge of sessions, only of OTP lifecycle.

import crypto from "crypto";
import bcrypt from "bcryptjs";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000; // exactly 5 minutes
export const OTP_MAX_ATTEMPTS = 5; // wrong-code attempts allowed per issued OTP
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60s between "Resend OTP" calls

/**
 * Generates a cryptographically random 6-digit numeric OTP as a string,
 * e.g. "045213". Uses crypto.randomInt so it's not predictable like
 * Math.random(), while still being a plain 6-digit code for the email.
 */
export function generateOtp(): string {
  const min = 0;
  const max = 10 ** OTP_LENGTH; // 1_000_000
  const value = crypto.randomInt(min, max);
  return value.toString().padStart(OTP_LENGTH, "0");
}

/** Hashes an OTP for storage — the raw code is never persisted. */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/** Compares a user-submitted OTP against the stored hash. */
export async function compareOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function isValidOtpFormat(otp: unknown): otp is string {
  return typeof otp === "string" && /^\d{6}$/.test(otp);
}

export function otpExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}

export function msUntil(date: Date | null | undefined): number {
  if (!date) return 0;
  return Math.max(0, new Date(date).getTime() - Date.now());
}
