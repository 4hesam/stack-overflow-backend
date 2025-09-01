import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  bio?: string;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    reputation: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true } // ✅ خودش createdAt و updatedAt اضافه می‌کنه
);

export default model<IUser>("User", UserSchema);