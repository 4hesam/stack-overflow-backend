

// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { User } from '../models/User.js';

// export interface AuthRequest extends Request {
//   user?: any;
// }

// export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   console.log('middleware called ...')
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return next();

//   try {
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
//     req.user = await User.findById(decoded.id);
//   } catch (err) {
//     console.warn('Invalid token');
//   }
//   next();
// };

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any; // User document از MongoDB بدون فیلد password
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔒 JWT Middleware called...');

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // اگر هدر نباشه، ادامه بدون لاگین
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('⚠️ No token provided');
    return next();
  }

  const secret: string = process.env.JWT_SECRET ?? 'secretkey';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // بررسی payload معتبر
    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      console.warn('⚠️ Invalid token payload');
      return next();
    }

    // کاربر از MongoDB لود می‌شود
    const user = await User.findById((decoded as any).userId).select('-password');
    if (!user) {
      console.warn('⚠️ User not found for given token');
      return next();
    }

    console.log('user: ', user)
    req.user = user; // کاربر در context قرار می‌گیرد
    next();
  } catch (error) {
    console.warn('⚠️ Invalid or expired token');
    next();
  }
};


// import { getUserFromToken } from "./path-to-your-root-file";

// app.use((req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(" ")[1]; // Expect: Bearer <token>
//   const userId = getUserFromToken(token);
//   req.userId = userId || undefined;
//   next();
// });

