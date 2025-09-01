import { Schema, model, Document, Types } from "mongoose";

export interface IQuestion extends Document {
  author: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  votes: {
    user: Types.ObjectId;
    type: "upvote" | "downvote";
  }[];
  answers: Types.ObjectId[];
  acceptedAnswer?: Types.ObjectId | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 10,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: 20,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    votes: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["upvote", "downvote"], required: true },
      },
    ],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    acceptedAnswer: { type: Schema.Types.ObjectId, ref: "Answer", default: null },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default model<IQuestion>("Question", QuestionSchema);