import { Schema, model, Types, Document } from "mongoose";

export interface IVote extends Document {
  userId: Types.ObjectId;
  targetId: Types.ObjectId; // می‌تونه سوال یا پاسخ باشه
  targetType: "Question" | "Answer";
  vote: 1 | -1;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ["Question", "Answer"], required: true },
    vote: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);

const VoteModel = model<IVote>("Vote", VoteSchema);
export default VoteModel;