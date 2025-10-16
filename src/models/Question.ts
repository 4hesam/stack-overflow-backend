import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User.js';

export interface IQuestion extends Document {
  title: string;
  content: string;
  author: Types.ObjectId | IUser;
  createdAt: Date;
  voteCount?: number;
}

const questionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

questionSchema.virtual('voteCount', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'question',
  count: true,
});

export const Question = model<IQuestion>('Question', questionSchema);
  