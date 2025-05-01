import mongoose from "mongoose";
import { User } from "../model/user";
import { Chat } from "../model/chat";

import type { Request, Response, NextFunction } from "express";
import type { CustomError } from "../app";
import type { ReqUser } from "../middleware/isAuth";
import type { IChat } from "../model/chat";

const createChat = async (req: Request, res: Response, next: NextFunction) => {
  const creatorId = (req as ReqUser).userId;
  const chatType = req.body.desc;

  let chatPayload: Partial<IChat> = {
    creatorId: new mongoose.Types.ObjectId(creatorId),
    isPrivate: true,
    usersId: [creatorId],
  };

  try {
    if (chatType === "private") {
      const friendId = req.params.id;
      if (!friendId) {
        const error = new Error(
          "Id do amigo é necessário para iniciar o chat.",
        ) as CustomError<string>;
        error.statusCode = 400;
        error.data = "Id do amigo é necessário para iniciar o chat.";
        throw error;
      }

      const friend = await User.findById({ _id: friendId });
      if (!friend) {
        const error = new Error(
          "Usuário não encontrado.",
        ) as CustomError<string>;
        error.statusCode = 404;
        error.data = "Usuário não encontrado.";
        throw error;
      }

      const existingPrivateChat = await Chat.findOne({
        desc: "private",
        usersId: { $all: [creatorId, friendId], $size: 2 },
      });

      if (existingPrivateChat) {
        res.status(200).json({
          message: "Chat privado já existe.",
          data: existingPrivateChat,
          isExisting: true,
        });
        return;
      }

      chatPayload.usersId?.push(friendId);
      chatPayload.name = req.body.name;
      chatPayload.desc = req.body.desc;
      chatPayload.isPrivate = true;

      const chat = new Chat(chatPayload);
      const result = await chat.save();

      await User.updateOne(
        { _id: creatorId },
        {
          $addToSet: { chatId: result._id },
        },
        { upsert: true },
      );

      await User.updateOne(
        { _id: friendId },
        {
          $addToSet: { chatId: result._id },
        },
        { upsert: true },
      );

      res.status(201).json({
        message: "Chat privado criado com sucesso.",
        data: result,
      });
      return;
    }
    if (chatType === "group") {
      if (Array.isArray(req.body.usersId)) {
        for (const userId of req.body.usersId) {
          if (!chatPayload.usersId?.includes(userId)) {
            chatPayload.usersId?.push(userId);
          }
        }
      }

      chatPayload.name = req.body.name || "Novo Grupo";
      chatPayload.desc = req.body.desc || "Chat em grupo";
      chatPayload.isPrivate = req.body.isPrivate ?? false;

      const chat = new Chat(chatPayload);
      const result = await chat.save();

      const updatePromises = chatPayload.usersId?.map((userId) =>
        User.updateOne(
          { _id: userId },
          { $addToSet: { chatId: result._id } },
          { upsert: true },
        ),
      );

      if (updatePromises) {
        await Promise.all(updatePromises);
      }

      res.status(201).json({
        message: "Chat em grupo criado com sucesso.",
        data: result,
      });
      return;
    }
    // erro
    const error = new Error("Tipo de chat inválido.") as CustomError<string>;
    error.statusCode = 400;
    error.data = "Tipo de chat inválido. Use 'private' ou 'group'.";
    throw error;
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: createChat. Erro: ${error.message}`;
    }
    next(error);
  }
};

const joinChat = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const userId = (req as ReqUser).userId;

  try {
    const chat = await Chat.findById({ _id: id });

    if (!chat) {
      const error = new Error("Chat não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Chat não encontrado.";

      throw error;
    }

    await User.updateOne(
      { _id: userId },
      { $addToSet: { chatId: chat._id } },
      { upsert: true },
    );

    res
      .status(201)
      .json({ message: "Chat adicionado com sucesso.", data: chat });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: joinChat. Erro: ${error.message}`;
    }
    next(error);
  }
};

const getChat = async (req: Request, res: Response, next: NextFunction) => {
  const name = req.params.name || undefined;

  try {
    if (name) {
      const chat = await Chat.findOne({ name: name });

      if (!chat) {
        const error = new Error("Chat não encontrado.") as CustomError<string>;
        error.statusCode = 404;
        error.data = "Chat não encontrado.";

        throw error;
      }
      res.status(200).json({ message: "Chat resgatado.", chat: chat });
      return;
    }

    const chat = await Chat.find({ desc: "group", isPrivate: false });

    res
      .status(200)
      .json({ message: "Chats resgatado.", chat: chat, oi: "oie" });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: getChat. Erro: ${error.message}`;
    }
    next(error);
  }
};

const getUserChat = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id || undefined;

  try {
    const user = await User.findById({ _id: id }).populate("chatId");

    if (!user) {
      const error = new Error("User não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "User não encontrado.";

      throw error;
    }

    const chats = user.chatId;
    res.status(200).json({ message: "Chats resgatados.", chats: chats });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: getUserChat. Erro: ${error.message}`;
    }
    next(error);
  }
};

const deleteChat = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const chat = await Chat.findById({ _id: id });

    if (!chat) {
      const error = new Error("Chat não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Chat não encontrado.";

      throw error;
    }
    if (chat.creatorId.toString() !== (req as ReqUser).userId) {
      const error = new Error("Não autorizado.") as CustomError<string[]>;
      error.statusCode = 403;
      error.data = ["Não autorizado."];
      throw error;
    }

    const result = await Chat.findByIdAndDelete({ _id: id });

    if (!result) {
      const error = new Error("Erro ao deletar chat.") as CustomError<string>;
      error.statusCode = 500;
      error.data = "Erro ao deletar chat.";

      throw error;
    }
    await User.updateMany(
      { chatId: result._id },
      { $pull: { chatId: result._id } },
    );
    res
      .status(200)
      .json({ message: "Chat deletado com sucesso.", result: result });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: deleteChat. Erro: ${error.message}`;
    }
    next(error);
  }
};

export default {
  createChat,
  deleteChat,
  getChat,
  joinChat,
  getUserChat,
};
