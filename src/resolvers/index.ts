
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

const resolvers = {
  Query: {
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
  },
  Mutation: {
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

    createQuestion: async (
      { input }: { input: CreateQuestionInput },
      _: any,
      context: any
    ) => {
      try {
        console.log("user", context.user);
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
          status: "failure",
          message: "Something went wrong !",
        };
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

    voteAnswer: async (
      { input }: { input: VoteInput },
      _: any,
      context: any
    ) => {
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
  },
};

export default resolvers;
