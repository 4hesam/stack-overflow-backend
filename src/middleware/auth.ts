
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { getUserFromToken } from "../utils/token.js"; // مسیر درست به فایل بالا

export interface AuthRequest extends Request {
  user?: any; // User document از MongoDB بدون فیلد password
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("🔒 JWT Middleware called...");

  const authHeader = req.headers.authorization;

  // اگر توکن وجود نداشت
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("⚠️ No token provided");
    return next();
  }

  try {
    // ✅ استفاده از تابع کمکی برای استخراج userId از توکن
    const userId = getUserFromToken(token);
    if (!userId) {
      console.warn("⚠️ Invalid token payload");
      return next();
    }

    // 🔍 پیدا کردن کاربر از دیتابیس
    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.warn("⚠️ User not found for given token");
      return next();
    }

    console.log("✅ Authenticated user:", user.email);
    req.user = user; // کاربر را به request اضافه کن

    next();
  } catch (error) {
    console.warn("⚠️ Invalid or expired token");
    next();
  }
};


