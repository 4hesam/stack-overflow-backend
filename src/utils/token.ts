import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

// ساختن JWT
export const signToken = (payload: JwtPayload): string => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// بررسی و decode JWT
export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};