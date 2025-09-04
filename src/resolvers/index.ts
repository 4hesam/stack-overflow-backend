import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Vote } from '../models/Vote.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateToken } from '../utils/token.js';

export const root = {
  register: async ({ username, email, password }: any) => {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    const token = generateToken(user);
    return { token, user };
  },

  login: async ({ email, password }: any) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid password');

    const token = generateToken(user);
    return { token, user };
  },

  me: async (_: any, req: AuthRequest) => req.user,

  createQuestion: async ({ title, content }: any, req: AuthRequest) => {
    if (!req.user) throw new Error('Not authenticated');
    const question = new Question({ title, content, author: req.user._id });
    await question.populate('author');
    return question;

  },

  createAnswer: async ({ questionId, content }: any, req: AuthRequest) => {
    if (!req.user) throw new Error('Not authenticated');
    const answer = new Answer({ content, question: questionId, author: req.user._id });
    await answer.populate('author question');
    return answer;
  },

  questions: async ({ page, limit }: any) => {
    const skip = (page - 1) * limit;
    return Question.find().skip(skip).limit(limit).populate('author').populate('voteCount');
  },

  question: async ({ id }: any) => {
    return Question.findById(id).populate('author').populate('voteCount');
  },

  voteQuestion: async ({ questionId, value }: any, req: AuthRequest) => {
    if (!req.user) throw new Error('Not authenticated');
    if (![1, -1].includes(value)) throw new Error('Invalid vote value');

    let vote = await Vote.findOne({ user: req.user._id, question: questionId });
    if (vote) {
      vote.value = value;
      await vote.save();
    } else {
      vote = new Vote({ user: req.user._id, question: questionId, value });
      await vote.save();
    }

    return Question.findById(questionId).populate('author').populate('voteCount');
  },

  voteAnswer: async ({ answerId, value }: any, req: AuthRequest) => {
    if (!req.user) throw new Error('Not authenticated');
    if (![1, -1].includes(value)) throw new Error('Invalid vote value');

    let vote = await Vote.findOne({ user: req.user._id, answer: answerId });
    if (vote) {
      vote.value = value;
      await vote.save();
    } else {
      vote = new Vote({ user: req.user._id, answer: answerId, value });
      await vote.save();
    }

    return Answer.findById(answerId).populate('author question').populate('voteCount');
  },
};
