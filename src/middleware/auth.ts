import { Request } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
}

export const getUserFromToken = (req: Request) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as TokenPayload;

    return decoded.userId;
  } catch (error) {
    return null; // توکن معتبر نیست یا وجود نداره
  }
};
