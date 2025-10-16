import { Request } from 'express';
import { User } from '../models/User.js'; // یا نوع User که تعریف کردی

export interface AuthRequest extends Request {
  user?: Partial<User>; // یا هر فیلدی که User شما دارد
}
