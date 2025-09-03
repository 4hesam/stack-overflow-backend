import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

// Contextی که Apollo Server می‌سازد
export interface Context {
  user?: {
    id: string;
  };
}

// بررسی و decode JWT
export const authMiddleware = (req: Request, res: Response, next: NextFunction): Context => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) return {}; // بدون کاربر

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    return { user: { id: payload.userId } };
  } catch (err) {
    console.warn("Invalid token:", err);
    return {};
  }
};