import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
}

export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);
  console.log("verify token: ", token);
  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
};
export function getUserFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded.userId;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}