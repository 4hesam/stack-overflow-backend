import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('middleware called ...')
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = await User.findById(decoded.id);
  } catch (err) {
    console.warn('Invalid token');
  }
  next();
};


// import { getUserFromToken } from "./path-to-your-root-file";

// app.use((req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(" ")[1]; // Expect: Bearer <token>
//   const userId = getUserFromToken(token);
//   req.userId = userId || undefined;
//   next();
// });

