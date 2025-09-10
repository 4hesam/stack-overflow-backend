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
