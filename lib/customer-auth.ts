import jwt from "jsonwebtoken";

export const CUSTOMER_SESSION_COOKIE_NAME = "customer_token";
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface CustomerSessionPayload {
  sub: string;
  email: string;
  scope: "customer";
}

export function signCustomerSessionToken(
  payload: CustomerSessionPayload,
): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyCustomerSessionToken(
  token: string,
): CustomerSessionPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const decoded = jwt.verify(token, secret) as CustomerSessionPayload;
  if (decoded.scope !== "customer") {
    throw new Error("Invalid session scope");
  }
  return decoded;
}
