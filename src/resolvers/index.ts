import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

/** --- Utility Helpers --- */
const signToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1d" });

const requireAuth = (context: any) => {
  if (!context.user) throw new Error("Authentication required");
  return context.user;
};

/** --- Resolvers --- */
export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return User.findById(user.id);
    },

    questions: async (_: any, { page = 1, limit = 10 }: any) => {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Question.find().skip(skip).limit(limit),
        Question.countDocuments(),
      ]);
      return { items, total, page, totalPages: Math.ceil(total / limit) };
    },

    question: (_: any, { id }: any) => Question.findById(id),
  },

  Mutation: {
    register: async (_: any, { username, email, password }: any) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already in use");

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
      return { token: signToken(user.id), user };
    },

    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");

      return { token: signToken(user.id), user };
    },

    createQuestion: async (_: any, { title, content }: any, context: any) => {
      const user = requireAuth(context);
      return Question.create({ title, content, author: user.id });
    },

    createAnswer: async (_: any, { questionId, content }: any, context: any) => {
      const user = requireAuth(context);
      return Answer.create({ content, question: questionId, author: user.id });
    },

    voteAnswer: async (_: any, { answerId, type }: any, context: any) => {
      const user = requireAuth(context);
      const answer = await Answer.findById(answerId);
      if (!answer) throw new Error("Answer not found");

      const existingVote = answer.votes.find(v => v.user.toString() === user.id);
      if (existingVote) {
        existingVote.type = type;
      } else {
        answer.votes.push({ user: user.id, type });
      }

      await answer.save();
      return answer;
    },
  },
};