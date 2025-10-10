
// export interface JwtPayload {
//   userId: string;
// }
// import jwt from 'jsonwebtoken';
// import { IUser } from '../models/User.js';

// export function generateToken(user: IUser) {
//   return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
// }

// export const signToken = (userId: string): string => {
//   if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
// };

// export const verifyToken = (token: string): JwtPayload => {
//   if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
//   return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
// };
// export function getUserFromToken(token: string): string | null {
//   try {
//     const payload = verifyToken(token)
//     return payload.userId
//   } catch (err) {
//     return null
//   }
// };
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
}

export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
    console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);
  console.log('verify token: ', token)
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
