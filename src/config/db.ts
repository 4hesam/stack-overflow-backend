// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devforum');

//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };
//
//
// config/db.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// تایپ‌ها
export interface User { id: string; username: string; email: string; password: string }
export interface Question { id: string; title: string; content: string; authorId: string; createdAt: string; voteCount?: number }
export interface Answer { id: string; content: string; questionId: string; authorId: string; voteCount?: number }
export interface Vote { id: string; userId: string; questionId?: string; answerId?: string; value: 1 | -1 }

// تبدیل import.meta.url به __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسیر پوشه داده‌ها
const dataDir = path.resolve(__dirname, "../data");

// تابع لود JSON
const loadJson = <T>(file: string): T[] => {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  if (!raw) return [];
  return JSON.parse(raw) as T[];
};

// لود داده‌ها
export const users = loadJson<User>(path.join(dataDir, "devforum.users.json"));
export const questions = loadJson<Question>(path.join(dataDir, "devforum.questions.json"));
export const answers = loadJson<Answer>(path.join(dataDir, "devforum.answers.json"));
export const votes = loadJson<Vote>(path.join(dataDir, "devforum.votes.json"));

// تابع ذخیره دوباره داده‌ها
export const saveJson = <T>(file: string, data: T[]) => {
  const filePath = path.resolve(file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};
