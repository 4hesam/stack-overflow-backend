import { Schema, model, Document, Types } from "mongoose";

export interface IAnswer extends Document {
  author: Types.ObjectId;
  question: Types.ObjectId;
  content: string;
  votes: {
    user: Types.ObjectId;
    type: "upvote" | "downvote";
  }[];
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    content: {
      type: String,
      required: [true, "Answer content is required"],
      minlength: 5,
    },
    votes: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["upvote", "downvote"], required: true },
      },
    ],
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IAnswer>("Answer", AnswerSchema);