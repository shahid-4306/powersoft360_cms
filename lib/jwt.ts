import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";
const JWT_EXPIRES_IN = "100m"; // 100 minutes

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}
