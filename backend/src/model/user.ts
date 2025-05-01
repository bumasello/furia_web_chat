import mongoose from "mongoose";

export interface IUser {
  _id?: string;
  username: string;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  chatId: mongoose.Types.ObjectId[];
  friendList: mongoose.Types.ObjectId[];
}

interface IUserModel extends Document, IUser {}

const userSchema = new mongoose.Schema<IUserModel>(
  {
    username: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    chatId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    friendList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model<IUserModel>("User", userSchema);
