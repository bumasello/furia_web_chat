import { Message } from "../model/message";

import mongoose from "mongoose";
import { Chat } from "../model/chat";
import { encrypt, decrypt } from "../util/encryption";

import type { Request, Response, NextFunction } from "express";
import type { ReqUser } from "../middleware/isAuth";
import type { IMessage, IMessageModel } from "../model/message";
import type { CustomError, ReqUserIo } from "../app";
import type { IChat } from "../model/chat";

const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as ReqUser).userId;
  const chatId = req.params.id;
  const message = req.body.message;

  try {
    const chat = await Chat.findById({ _id: chatId });

    if (!chat) {
      const error = new Error("Chat não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Chat não encontrado.";

      throw error;
    }

    const encryptedData = encrypt(message);

    const newMsg = new Message<IMessage>({
      content: encryptedData.content,
      iv: encryptedData.iv,
      userId: new mongoose.Types.ObjectId(userId),
      chatId: new mongoose.Types.ObjectId(chatId),
    });

    const result = await newMsg.save();

    await Chat.updateOne(
      { _id: chatId },
      {
        $push: { msgId: result._id },
      },
    );

    (req as ReqUserIo).io.to(chatId).emit("newMessage", {
      chatId,
      _id: result._id,
      userId,
      content: message,
      timestamp: result.createdAt,
    });

    res.status(201).json({
      message: "Messagem criada com sucesso.",
      userId: userId,
      result: result,
    });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: createMessage. Erro: ${error.message}`;
    }
    console.error(error);
    next(error);
  }
};

const getChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  try {
    const chat = (await Chat.findById({ _id: id }).populate<IMessageModel>(
      "msgId",
    )) as (IChat & { msgId: IMessageModel[] }) | null;

    if (!chat) {
      const error = new Error("Chat não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Chat não encontrado.";

      throw error;
    }
    if (!chat.msgId) {
      const error = new Error(
        "Erro ao retornar as mensagens",
      ) as CustomError<string>;
      error.statusCode = 422;
      error.data = "Erro ao retornar as mensagens";

      throw error;
    }

    const decryptedMessages = (chat.msgId || []).map((msg: IMessageModel) => {
      const decryptedContent = decrypt(msg.content, msg.iv);

      return {
        id: msg._id,
        content: decryptedContent,
        userId: msg.userId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      };
    });

    res
      .status(200)
      .json({ message: "Mensagens resgatadas.", messages: decryptedMessages });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: getChatMessage. Erro: ${error.message}`;
    }
    next(error);
  }
};

export default {
  createMessage,
  getChatMessage,
};
