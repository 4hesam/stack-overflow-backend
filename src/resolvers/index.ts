// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";
// import { User } from "../models/User.js";
// import { Question } from "../models/Question.js";
// import { Answer } from "../models/Answer.js";
// import { Vote } from "../models/Vote.js";
// import { AuthRequest } from "../middleware/auth.js";
// import { generateToken } from "../utils/token.js";

// import { RegisterDto, LoginDto } from "../dto/auth.dto.js";
// import {
//   CreateQuestionDto,
//   QuestionPaginationDto,
//   GetQuestionDto,
//   VoteQuestionDto,
// } from "../dto/question.dto.js";
// import { CreateAnswerDto, VoteAnswerDto } from "../dto/answer.dto.js";

// export const root = {
//   // ثبت‌نام کاربر جدید
//   register: async ({ input }: { input: RegisterDto }) => {
//     const { username, email, password } = input;
//     const hashed = await bcrypt.hash(password, 10);
//     const user = new User({ username, email, password: hashed });
//     await user.save();

//     const token = generateToken(user);
//     return { token, user };
//   },

//   // ورود کاربر
//   login: async ({ input }: { input: LoginDto }) => {
//     const { email, password } = input;
//     const user = await User.findOne({ email });
//     if (!user) throw new Error("User not found");

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) throw new Error("Invalid password");

//     const token = generateToken(user);
//     return { token, user };
//   },

//   // اطلاعات کاربر فعلی
//   me: async (_: any, req: AuthRequest) => req.user,

//   // ساخت سوال جدید
//   createQuestion: async (
//     { input }: { input: CreateQuestionDto },
//     req: AuthRequest
//   ) => {
//     if (!req.user) throw new Error("Not authenticated");
//     const { title, content } = input;

//     const question = new Question({ title, content, author: req.user._id });
//     await question.save();

//     const populated = await question.populate(["author", "voteCount"]);

//     return {
//       ...populated.toObject({ virtuals: true }),
//       voteCount: populated.voteCount ?? 0,
//     };
//   },

//   // ساخت پاسخ جدید
//   createAnswer: async (
//     { input }: { input: CreateAnswerDto },
//     req: AuthRequest
//   ) => {
//     if (!req.user) throw new Error("Not authenticated");
//     const { questionId, content } = input;

//     // اعتبارسنجی ObjectId
//     if (!mongoose.Types.ObjectId.isValid(questionId)) {
//       throw new Error("Invalid question id");
//     }

//     const question = await Question.findById(questionId);
//     if (!question) throw new Error("Question not found");

//     const answer = new Answer({
//       content,
//       question: question._id,
//       author: req.user._id,
//     });

//     await answer.save();

//     const populated = await answer.populate([
//       { path: "author" },
//       { path: "question" },
//       { path: "voteCount" },
//     ]);

//     return {
//       ...populated.toObject({ virtuals: true }),
//       voteCount: populated.voteCount ?? 0,
//     };
//   },

//   // گرفتن لیست سوال‌ها
//   questions: async ({ pagination }: { pagination: QuestionPaginationDto }) => {
//     const { page, limit } = pagination;
//     const skip = (page - 1) * limit;

//     const [questions,total] = await Promise.all([
//       Question.find()
//       .skip(skip)
//       .limit(limit)
//       .populate(["author", "voteCount"]),
//     Question.countDocuments(),
//   ]);
//     return {
//       questions: questions.map((q) => ({
//       ...q.toObject({ virtuals: true }),
//       voteCount: q.voteCount ?? 0,
//     })),
//     total,
//     };
//   },

//   // گرفتن یک سوال خاص
//   question: async ({ input }: { input: GetQuestionDto }) => {
//     if (!mongoose.Types.ObjectId.isValid(input.id)) {
//       throw new Error("Invalid question id");
//     }

//     const question = await Question.findById(input.id).populate([
//       "author",
//       "voteCount",
//     ]);

//     if (!question) return null;

//     return {
//       ...question.toObject({ virtuals: true }),
//       voteCount: question.voteCount ?? 0,
//     };
//   },

//   // ثبت رای روی سوال
//   voteQuestion: async (
//     { input }: { input: VoteQuestionDto },
//     req: AuthRequest
//   ) => {
//     if (!req.user) throw new Error("Not authenticated");
//     if (![1, -1].includes(input.value)) throw new Error("Invalid vote value");

//     if (!mongoose.Types.ObjectId.isValid(input.questionId)) {
//       throw new Error("Invalid question id");
//     }

//     let vote = await Vote.findOne({
//       user: req.user._id,
//       question: input.questionId,
//     });

//     if (vote) {
//       vote.value = input.value;
//       await vote.save();
//     } else {
//       vote = new Vote({
//         user: req.user._id,
//         question: input.questionId,
//         value: input.value,
//       });
//       await vote.save();
//     }

//     const question = await Question.findById(input.questionId).populate([
//       "author",
//       "voteCount",
//     ]);

//     return question
//       ? {
//           ...question.toObject({ virtuals: true }),
//           voteCount: question.voteCount ?? 0,
//         }
//       : null;
//   },
//   // تعداد سوالات داخل دیتابیس
//   questionCount: async () => {
//   return await Question.countDocuments();
// },
//   // ثبت رای روی پاسخ
//   voteAnswer: async ({ input }: { input: VoteAnswerDto }, req: AuthRequest) => {
//     console.log("api called ...");
//     if (!req.user) throw new Error("Not authenticated");
//     if (![1, -1].includes(input.value)) throw new Error("Invalid vote value");

//     if (!mongoose.Types.ObjectId.isValid(input.answerId)) {
//       throw new Error("Invalid answer id");
//     }

//     const answer = await Answer.findById(input.answerId);

//     if (!answer) throw new Error("Answer not found");

//     let vote = await Vote.findOne({
//       user: req.user._id,
//       answer: input.answerId,
//     });

//     console.log("answer:", input.answerId);
//     console.log("user:", req.user._id);
//     console.log("vote: ", vote);

//     if (vote) {
//       vote.value = input.value;
//       await vote.save();
//     } else {
//       vote = new Vote({
//         user: req.user._id,
//         answer: input.answerId,
//         question: answer.question,
//         value: input.value,
//       });
//       await vote.save();
//     }
//     console.log("vote created: ", vote);

//     // const answer = await Answer.findById(input.answerId)
//     //   .populate(["author", "question", "voteCount"]);

//     return {
//       ...answer.toObject({ virtuals: true }),
//       voteCount: answer.voteCount ?? 0,
//     };
//   },
// };
//new JSON

//
// root.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { users, questions, answers, votes, saveJson, User, Question, Answer, Vote } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = "your-secret-key"; // بهتره از .env بگیری

interface AuthRequest {
  userId?: string;
}

interface RegisterInput { username: string; email: string; password: string }
interface LoginInput { email: string; password: string }
interface CreateQuestionInput { title: string; content: string }
interface CreateAnswerInput { questionId: string; content: string }
interface PaginationInput { page: number; limit: number }
interface VoteInput { questionId?: string; answerId?: string; value: 1 | -1 }

// ⬇️ JWT Helper Functions
export const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  console.log("🔐 JWT_SECRET (sign):", process.env.JWT_SECRET); // تست مقدار
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const getUserFromToken = (token?: string): string | null => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};

// import User from '../models/User.js'

export const root = {
  register: async ({ input }: { input: RegisterInput }) => {
    const { username, email, password } = input;
    if (users.find(u => u.email === email)) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(password, 10);
    const newUser: User = { id: uuidv4(), username, email, password: hashed };
    users.push(newUser);
    saveJson("../src/data/devforum.users.json", users);

    const token = generateToken(newUser.id);
    return { token, user: newUser };
  },

  login: async ({ input }: { input: LoginInput }) => {
    const user = users.find(u => u.email === input.email);
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = generateToken(user.id);
    console.log('user token: ', token)
    return { token, user };
  },

 me: async (_: any, req: AuthRequest, args: any, context: any) => {
  try {

    // گرفتن اطلاعات کاربر از MongoDB
    // const userData = await User.findById(user.id)
    //   .populate('questions') // اگر رابطه تعریف شده
    //   .lean();
   const user = context.user;
  if (!user) return null;

  const userData = users.find(u => u.id === user.id);
  if (!userData) return null;

  const myQuestions = questions
    .filter(q => q.authorId === user.id)
    .map(q => ({
      ...q,
      author: userData,
      voteCount: votes
        .filter(v => v.questionId === q.id)
        .reduce((sum, v) => sum + (v.value ?? 0), 0)
    }));

  return {
    ...userData,
    questions: myQuestions
  };
  } catch (err) {
    console.error('Error in me resolver:', err);
    throw new Error('Failed to fetch user');
  }
},


  createQuestion: ({ input }: { input: CreateQuestionInput }, req: AuthRequest) => {
    if (!req.userId) throw new Error("Not authenticated");

    const newQ: Question = {
      id: uuidv4(),
      title: input.title,
      content: input.content,
      authorId: req.userId,
      createdAt: new Date().toISOString(),
      voteCount: 0
    };

    questions.push(newQ);
    saveJson("../src/data/devforum.questions.json", questions);

    return { ...newQ, author: users.find(u => u.id === req.userId), voteCount: 0 };
  },

  createAnswer: ({ input }: { input: CreateAnswerInput }, req: AuthRequest) => {
    if (!req.userId) throw new Error("Not authenticated");

    const question = questions.find(q => q.id === input.questionId);
    if (!question) throw new Error("Question not found");

    const newA: Answer = {
      id: uuidv4(),
      content: input.content,
      questionId: question.id,
      authorId: req.userId,
      voteCount: 0
    };

    answers.push(newA);
    saveJson("../src/data/devforum.answers.json", answers);

    return { ...newA, author: users.find(u => u.id === req.userId), question, voteCount: 0 };
  },

  questions: ({ pagination }: { pagination: PaginationInput }) => {
    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;

    const pagedQuestions = questions.slice(start, end).map(q => ({
      ...q,
      author: users.find(u => u.id === q.authorId),
      voteCount: votes
        .filter(v => v.questionId === q.id)
        .reduce((sum, v) => sum + (v.value ?? 0), 0)
    }));

    return { questions: pagedQuestions, total: questions.length };
  },

  question: ({ input }: { input: { id: string } }) => {
    const q = questions.find(q => q.id === input.id);
    if (!q) return null;

    return {
      ...q,
      author: users.find(u => u.id === q.authorId),
      voteCount: votes
        .filter(v => v.questionId === q.id)
        .reduce((sum, v) => sum + (v.value ?? 0), 0)
    };
  },

  voteQuestion: ({ input }: { input: VoteInput }, req: AuthRequest) => {
    if (!req.userId) throw new Error("Not authenticated");
    if (!input.questionId) throw new Error("Question ID required");

    const q = questions.find(q => q.id === input.questionId);
    if (!q) throw new Error("Question not found");

    let vote = votes.find(v => v.userId === req.userId && v.questionId === q.id);
    if (vote) {
      vote.value = input.value!;
    } else {
      vote = { id: uuidv4(), userId: req.userId, questionId: q.id, value: input.value! };
      votes.push(vote);
    }

    saveJson("../src/data/devforum.votes.json", votes);

    const voteCount = votes
      .filter(v => v.questionId === q.id)
      .reduce((sum, v) => sum + (v.value ?? 0), 0);

    return {
      ...q,
      author: users.find(u => u.id === q.authorId),
      voteCount
    };
  },

  voteAnswer: ({ input }: { input: VoteInput }, req: AuthRequest) => {
    if (!req.userId) throw new Error("Not authenticated");
    if (!input.answerId) throw new Error("Answer ID required");

    const a = answers.find(a => a.id === input.answerId);
    if (!a) throw new Error("Answer not found");

    let vote = votes.find(v => v.userId === req.userId && v.answerId === a.id);
    if (vote) {
      vote.value = input.value!;
    } else {
      vote = { id: uuidv4(), userId: req.userId, answerId: a.id, questionId: a.questionId, value: input.value! };
      votes.push(vote);
    }

    saveJson("../src/data/devforum.votes.json", votes);

    const voteCount = votes
      .filter(v => v.answerId && v.answerId === a.id)
      .reduce((sum, v) => sum + (v.value ?? 0), 0);

    return {
      ...a,
      author: users.find(u => u.id === a.authorId),
      question: questions.find(q => q.id === a.questionId),
      voteCount
    };
  
  }
};
