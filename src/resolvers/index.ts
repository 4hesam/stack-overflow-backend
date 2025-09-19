import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Question } from "../models/Question.js";
import { Answer } from "../models/Answer.js";
import { Vote } from "../models/Vote.js";
import { AuthRequest } from "../middleware/auth.js";
import { generateToken } from "../utils/token.js";

import { RegisterDto, LoginDto } from "../dto/auth.dto.js";
import {
  CreateQuestionDto,
  QuestionPaginationDto,
  GetQuestionDto,
  VoteQuestionDto,
} from "../dto/question.dto.js";
import { CreateAnswerDto, VoteAnswerDto } from "../dto/answer.dto.js";

export const root = {
  // ثبت‌نام کاربر جدید
  register: async ({ input }: { input: RegisterDto }) => {
    const { username, email, password } = input;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    const token = generateToken(user);
    return { token, user };
  },

  // ورود کاربر
  login: async ({ input }: { input: LoginDto }) => {
    const { email, password } = input;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = generateToken(user);
    return { token, user };
  },

  // اطلاعات کاربر فعلی
  me: async (_: any, req: AuthRequest) => req.user,

  // ساخت سوال جدید
  createQuestion: async (
    { input }: { input: CreateQuestionDto },
    req: AuthRequest
  ) => {
    if (!req.user) throw new Error("Not authenticated");
    const { title, content } = input;

    const question = new Question({ title, content, author: req.user._id });
    await question.save();

    const populated = await question.populate(["author", "voteCount"]);

    return {
      ...populated.toObject({ virtuals: true }),
      voteCount: populated.voteCount ?? 0,
    };
  },

  // ساخت پاسخ جدید
  createAnswer: async (
    { input }: { input: CreateAnswerDto },
    req: AuthRequest
  ) => {
    if (!req.user) throw new Error("Not authenticated");
    const { questionId, content } = input;

    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new Error("Invalid question id");
    }

    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    const answer = new Answer({
      content,
      question: question._id,
      author: req.user._id,
    });

    await answer.save();

    const populated = await answer.populate([
      { path: "author" },
      { path: "question" },
      { path: "voteCount" },
    ]);

    return {
      ...populated.toObject({ virtuals: true }),
      voteCount: populated.voteCount ?? 0,
    };
  },

  // گرفتن لیست سوال‌ها
  questions: async ({ input }: { input: QuestionPaginationDto }) => {
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .skip(skip)
      .limit(limit)
      .populate(["author", "voteCount"]);

    return questions.map((q) => ({
      ...q.toObject({ virtuals: true }),
      voteCount: q.voteCount ?? 0,
    }));
  },

  // گرفتن یک سوال خاص
  question: async ({ input }: { input: GetQuestionDto }) => {
    if (!mongoose.Types.ObjectId.isValid(input.id)) {
      throw new Error("Invalid question id");
    }

    const question = await Question.findById(input.id).populate([
      "author",
      "voteCount",
    ]);

    if (!question) return null;

    return {
      ...question.toObject({ virtuals: true }),
      voteCount: question.voteCount ?? 0,
    };
  },

  // ثبت رای روی سوال
  voteQuestion: async (
    { input }: { input: VoteQuestionDto },
    req: AuthRequest
  ) => {
    if (!req.user) throw new Error("Not authenticated");
    if (![1, -1].includes(input.value)) throw new Error("Invalid vote value");

    if (!mongoose.Types.ObjectId.isValid(input.questionId)) {
      throw new Error("Invalid question id");
    }

    let vote = await Vote.findOne({
      user: req.user._id,
      question: input.questionId,
    });

    if (vote) {
      vote.value = input.value;
      await vote.save();
    } else {
      vote = new Vote({
        user: req.user._id,
        question: input.questionId,
        value: input.value,
      });
      await vote.save();
    }

    const question = await Question.findById(input.questionId).populate([
      "author",
      "voteCount",
    ]);

    return question
      ? {
          ...question.toObject({ virtuals: true }),
          voteCount: question.voteCount ?? 0,
        }
      : null;
  },
  // تعداد سوالات داخل دیتابیس
  questionCount: async () => {
  return await Question.countDocuments();
},
  // ثبت رای روی پاسخ
  voteAnswer: async ({ input }: { input: VoteAnswerDto }, req: AuthRequest) => {
    console.log("api called ...");
    if (!req.user) throw new Error("Not authenticated");
    if (![1, -1].includes(input.value)) throw new Error("Invalid vote value");

    if (!mongoose.Types.ObjectId.isValid(input.answerId)) {
      throw new Error("Invalid answer id");
    }

    const answer = await Answer.findById(input.answerId);

    if (!answer) throw new Error("Answer not found");

    let vote = await Vote.findOne({
      user: req.user._id,
      answer: input.answerId,
    });

    console.log("answer:", input.answerId);
    console.log("user:", req.user._id);
    console.log("vote: ", vote);

    if (vote) {
      vote.value = input.value;
      await vote.save();
    } else {
      vote = new Vote({
        user: req.user._id,
        answer: input.answerId,
        question: answer.question,
        value: input.value,
      });
      await vote.save();
    }
    console.log("vote created: ", vote);

    // const answer = await Answer.findById(input.answerId)
    //   .populate(["author", "question", "voteCount"]);

    return {
      ...answer.toObject({ virtuals: true }),
      voteCount: answer.voteCount ?? 0,
    };
  },
};
