import mongoose from "mongoose";

export interface IChat {
  name?: string;
  desc: string;
  isPrivate: boolean;
  creatorId: mongoose.Types.ObjectId;
  usersId: string[];
  msgId?: string[];
  friendId?: string;
}

interface IChatModel extends Document, IChat {
  _id?: mongoose.Types.ObjectId;
}

const chatSchema = new mongoose.Schema<IChatModel>(
  {
    name: String,
    desc: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    usersId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    msgId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true },
);

export const Chat = mongoose.model<IChatModel>("Chat", chatSchema);
