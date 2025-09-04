import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User.js';
import { IQuestion } from './Question.js';
import { IAnswer } from './Answer.js';

export interface IVote extends Document {
  user: Types.ObjectId | IUser;
  question?: Types.ObjectId | IQuestion;
  answer?: Types.ObjectId | IAnswer;
  value: number; // 1 = upvote, -1 = downvote
  createdAt: Date;
}

const voteSchema = new Schema<IVote>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  answer: { type: Schema.Types.ObjectId, ref: 'Answer' },
  value: { type: Number, enum: [1, -1], required: true },
  createdAt: { type: Date, default: Date.now },
});

voteSchema.index({ user: 1, question: 1 }, { unique: true, sparse: true });
voteSchema.index({ user: 1, answer: 1 }, { unique: true, sparse: true });

export const Vote = model<IVote>('Vote', voteSchema);
