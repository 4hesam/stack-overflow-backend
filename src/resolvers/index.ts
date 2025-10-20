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
import { User } from "../models/User.js";
import { Question } from "../models/Question.js";
import { Answer } from "../models/Answer.js";
import { Vote } from "../models/Vote.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
interface LoginInput {
  email: string;
  password: string;
}
interface CreateQuestionInput {
  title: string;
  content: string;
}
interface CreateAnswerInput {
  questionId: string;
  content: string;
}
interface VoteInput {
  questionId?: string;
  answerId?: string;
  value: 1 | -1;
}
interface PaginationInput {
  page: number;
  limit: number;
}

export const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const root = {
  register: async ({ input }: { input: RegisterInput }) => {
    const { username, email, password } = input;
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashed });

    const userId = (newUser._id as Types.ObjectId).toString();
    const token = generateToken(userId);

    return { token, user: { ...newUser.toObject(), id: userId } };
  },

  login: async ({ input }: { input: LoginInput }) => {
    const user = await User.findOne({ email: input.email });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new Error("Invalid password");

    const userId = (user._id as Types.ObjectId).toString();
    const token = generateToken(userId);

    return { token, user: { ...user.toObject(), id: userId } };
  },

  me: async (_: any, args: any, context: any) => {
    const user = context.user;
    if (!user) return null;

    const myQuestions = await Question.find({ author: user._id }).lean();
    const questionsWithVotes = await Promise.all(
      myQuestions.map(async (q) => {
        const voteCount = await Vote.countDocuments({ question: q._id });
        return { ...q, id: (q._id as Types.ObjectId).toString(), voteCount };
      })
    );

    return {
      ...user.toObject(),
      id: (user._id as Types.ObjectId).toString(),
      questions: questionsWithVotes,
    };
  },

  createQuestion: async (
    { input }: { input: CreateQuestionInput },
    _: any,
    context: any
  ) => {
    try {
      console.log('user', context.user)
      if (!context.user) throw new Error("Not authenticated");

      const newQ = await Question.create({
        title: input.title,
        content: input.content,
        author: context.user._id,
        createdAt: new Date(),
      });

      return {
        ...newQ.toObject(),
        id: (newQ._id as Types.ObjectId).toString(),
        author: {
          id: (context.user._id as Types.ObjectId).toString(),
          username: context.user.username,
          email: context.user.email,
        },
        voteCount: 0,
      };
    } catch (error: any) {
      console.log("error addquestion ", error.message);
      return {
        status: 'failure', 
        message: "Something went wrong !",
      }
    }
  },

  createAnswer: async (
    { input }: { input: CreateAnswerInput },
    _: any,
    context: any
  ) => {
    if (!context.user) throw new Error("Not authenticated");

    const question = await Question.findById(input.questionId);
    if (!question) throw new Error("Question not found");

    const newA = await Answer.create({
      content: input.content,
      question: question._id,
      author: context.user._id,
      createdAt: new Date(),
    });

    return {
      ...newA.toObject(),
      id: (newA._id as Types.ObjectId).toString(),
      author: {
        id: (context.user._id as Types.ObjectId).toString(),
        username: context.user.username,
        email: context.user.email,
      },
      question: {
        id: (question._id as Types.ObjectId).toString(),
        title: question.title,
      },
      voteCount: 0,
    };
  },

  questions: async ({ pagination }: { pagination: PaginationInput }) => {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const questions = await Question.find().skip(skip).limit(limit).lean();

    const questionsWithVotes = await Promise.all(
      questions.map(async (q) => {
        const author = await User.findById(q.author);
        const voteCount = await Vote.countDocuments({ question: q._id });
        return {
          ...q,
          id: (q._id as Types.ObjectId).toString(),
          author: author
            ? {
                id: (author._id as Types.ObjectId).toString(),
                username: author.username,
                email: author.email,
              }
            : null,
          voteCount,
        };
      })
    );

    const total = await Question.countDocuments();
    return { questions: questionsWithVotes, total };
  },

  question: async ({ input }: { input: { id: string } }) => {
    const q = await Question.findById(input.id).lean();
    if (!q) return null;

    const author = await User.findById(q.author);
    const voteCount = await Vote.countDocuments({ question: q._id });

    return {
      ...q,
      id: (q._id as Types.ObjectId).toString(),
      author: author
        ? {
            id: (author._id as Types.ObjectId).toString(),
            username: author.username,
            email: author.email,
          }
        : null,
      voteCount,
    };
  },

  voteQuestion: async (
    { input }: { input: VoteInput },
    _: any,
    context: any
  ) => {
    if (!context.user) throw new Error("Not authenticated");
    if (!input.questionId) throw new Error("Question ID required");

    const question = await Question.findById(input.questionId);
    if (!question) throw new Error("Question not found");

    let vote = await Vote.findOne({
      user: context.user._id,
      question: question._id,
    });
    if (vote) {
      vote.value = input.value!;
      await vote.save();
    } else {
      vote = await Vote.create({
        user: context.user._id,
        question: question._id,
        value: input.value!,
      });
    }

    const voteCount = await Vote.countDocuments({ question: question._id });
    const author = await User.findById(question.author);

    return {
      ...question.toObject(),
      id: (question._id as Types.ObjectId).toString(),
      author: author
        ? {
            id: (author._id as Types.ObjectId).toString(),
            username: author.username,
            email: author.email,
          }
        : null,
      voteCount,
    };
  },

  voteAnswer: async ({ input }: { input: VoteInput }, _: any, context: any) => {
    if (!context.user) throw new Error("Not authenticated");
    if (!input.answerId) throw new Error("Answer ID required");

    const answer = await Answer.findById(input.answerId);
    if (!answer) throw new Error("Answer not found");

    let vote = await Vote.findOne({
      user: context.user._id,
      answer: answer._id,
    });
    if (vote) {
      vote.value = input.value!;
      await vote.save();
    } else {
      vote = await Vote.create({
        user: context.user._id,
        answer: answer._id,
        question: answer.question,
        value: input.value!,
      });
    }

    const voteCount = await Vote.countDocuments({ answer: answer._id });
    const author = await User.findById(answer.author);
    const question = await Question.findById(answer.question);

    return {
      ...answer.toObject(),
      id: (answer._id as Types.ObjectId).toString(),
      author: author
        ? {
            id: (author._id as Types.ObjectId).toString(),
            username: author.username,
            email: author.email,
          }
        : null,
      question: question
        ? {
            id: (question._id as Types.ObjectId).toString(),
            title: question.title,
          }
        : null,
      voteCount,
    };
  },
};
