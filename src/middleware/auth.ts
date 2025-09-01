import type { Request } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload { userId: string; }

export const authMiddleware = ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { user: null };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return { user: { id: decoded.userId } };
  } catch {
    return { user: null };
  }
};