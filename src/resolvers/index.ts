import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      return User.findById(context.user.id);
    },
    questions: async (_: any, { page = 1, limit = 10 }: any) => {
      return Question.find().skip((page-1)*limit).limit(limit);
    },
    question: async (_: any, { id }: any) => Question.findById(id),
  },
  Mutation: {
    register: async (_: any, { username, email, password }: any) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
      return { token, user };
    },
    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid credentials");
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
      return { token, user };
    },
    createQuestion: async (_: any, { title, content }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      return Question.create({ title, content, author: context.user.id });
    },
    createAnswer: async (_: any, { questionId, content }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      return Answer.create({ content, question: questionId, author: context.user.id });
    },
    voteAnswer: async (_: any, { answerId, type }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      const answer = await Answer.findById(answerId);
      if (!answer) throw new Error("Answer not found");
      const existing = answer.votes.find(v => v.user.toString() === context.user.id);
      if (existing) existing.type = type; else answer.votes.push({ user: context.user.id, type });
      await answer.save();
      return answer;
    },
  },
};