import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User.js';
import { IQuestion } from './Question.js';

export interface IAnswer extends Document {
  content: string;
  question: Types.ObjectId | IQuestion;
  author: Types.ObjectId | IUser;
  createdAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  content: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

answerSchema.virtual('voteCount', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'answer',
  count: true,
});

export const Answer = model<IAnswer>('Answer', answerSchema);
