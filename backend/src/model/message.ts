import mongoose from "mongoose";

export interface IMessage {
  content: string;
  iv: string;
  userId: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
}

export interface IMessageModel extends Document, IMessage {
  _id: mongoose.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}

const messageSchema = new mongoose.Schema<IMessageModel>(
  {
    content: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Chat",
    },
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessageModel>("Message", messageSchema);
