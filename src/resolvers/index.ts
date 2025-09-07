import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Question } from "../models/Question.js";
import { Answer } from "../models/Answer.js";
import { Vote } from "../models/Vote.js";
import { AuthRequest } from "../middleware/auth.js";
import { generateToken } from "../utils/token.js";

import { RegisterDto, LoginDto } from "../dto/auth.dto.js";
import { CreateQuestionDto, QuestionPaginationDto, GetQuestionDto, VoteQuestionDto } from "../dto/question.dto.js";
import { CreateAnswerDto, VoteAnswerDto } from "../dto/answer.dto.js";

export const root = {
  register: async ({ input }: { input: RegisterDto }) => {
    const { username, email, password } = input;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    const token = generateToken(user);
    return { token, user };
  },

  login: async ({ input }: { input: LoginDto }) => {
    const { email, password } = input;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = generateToken(user);
    return { token, user };
  },

  me: async (_: any, req: AuthRequest) => req.user,

  createQuestion: async ({ input }: { input: CreateQuestionDto }, req: AuthRequest) => {
    if (!req.user) throw new Error("Not authenticated");
    const { title, content } = input;
    const question = new Question({ title, content, author: req.user._id });
    await question.populate("author");
    return question;
  },

  createAnswer: async ({ input }: { input: CreateAnswerDto }, req: AuthRequest) => {
    if (!req.user) throw new Error("Not authenticated");
    const { questionId, content } = input;
    const answer = new Answer({ content, question: questionId, author: req.user._id });
    await answer.populate("author question");
    return answer;
  },

  questions: async ({ input }: { input: QuestionPaginationDto }) => {
    const { page, limit } = input;
    const skip = (page - 1) * limit;
    return Question.find().skip(skip).limit(limit).populate("author").populate("voteCount");
  },

  question: async ({ input }: { input: GetQuestionDto }) => {
    return Question.findById(input.id).populate("author").populate("voteCount");
  },

  voteQuestion: async ({ input }: { input: VoteQuestionDto }, req: AuthRequest) => {
    if (!req.user) throw new Error("Not authenticated");
    if (![1, -1].includes(input.value)) throw new Error("Invalid vote value");

    let vote = await Vote.findOne({ user: req.user._id, question: input.questionId });
    if (vote) {
      vote.value = input.value;
      await vote.save();
    } else {
      vote = new Vote({ user: req.user._id, question: input.questionId, value: input.value });
      await vote.save();
    }

    return Question.findById(input.questionId).populate("author").populate("voteCount");
  },

  voteAnswer: async ({ input }: { input: VoteAnswerDto }, req: AuthRequest) => {
    if (!req.user) throw new Error("Not authenticated");
    if (![1, -1].includes(input.value)) throw new Error("Invalid vote value");

    let vote = await Vote.findOne({ user: req.user._id, answer: input.answerId });
    if (vote) {
      vote.value = input.value;
      await vote.save();
    } else {
      vote = new Vote({ user: req.user._id, answer: input.answerId, value: input.value });
      await vote.save();
    }

    return Answer.findById(input.answerId).populate("author question").populate("voteCount");
  },
};
