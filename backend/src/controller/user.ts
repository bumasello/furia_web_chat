import { validationResult } from "express-validator";
import { User } from "../model/user";
import bcrypt from "bcrypt";

import type { Request, Response, NextFunction } from "express";
import type { CustomError } from "../app";
import type { IUser } from "../model/user";
import type { ValidationError } from "express-validator";
import type { ReqUser } from "../middleware/isAuth";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error: CustomError<ValidationError[]> = new Error(
      "Validação falhou.",
    );
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const userData: IUser = req.body;
  const { email, password, first_name, last_name = "", username } = userData;

  try {
    if (!email || !password || !first_name || !username) {
      const error = new Error("Dados faltantes.") as CustomError<string[]>;
      error.statusCode = 422;
      error.data = ["email", "password", "first_name", "username"];

      throw error;
    }
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      const error = new Error("Usuário cadastrado.") as CustomError<string>;
      error.statusCode = 422;
      error.data = "Usuário já cadastrado.";

      throw error;
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      first_name,
      last_name,
      username,
      password: hashedPwd,
    });

    const result = await user.save();

    res.status(201).json({ message: "Usuário criado.", userId: result._id });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: createUser. Erro: ${error.message}`;
    }
    next(error);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username || undefined;

  try {
    if (username) {
      const user = await User.findOne({ username: username });

      if (!user) {
        const error = new Error(
          "Usuário não encontrado.",
        ) as CustomError<string>;
        error.statusCode = 404;
        error.data = "Usuário não encontrado.";

        throw error;
      }

      res.status(200).json({ message: "Usuário resgatado.", users: user });
      return;
    }

    const users = await User.find();
    res.status(200).json({ message: "Usuários resgatados.", users: users });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: getUser. Erro: ${error.message}`;
    }
    next(error);
  }
};

const postAddfriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id || undefined;
  const userId = (req as ReqUser).userId;

  try {
    const userFriend = await User.findById({ _id: id });

    if (!userFriend) {
      const error = new Error("Amigo não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Amigo não encontrado.";

      throw error;
    }

    const user = await User.findById({ _id: userId });

    if (!user) {
      const error = new Error("Usuário não encontrado.") as CustomError<string>;
      error.statusCode = 422;
      error.data = "Usuário não encontrado.";

      throw error;
    }

    await User.updateOne(
      { _id: userId },
      {
        $addToSet: { friendList: id },
      },
      { upsert: true },
    );

    await User.updateOne(
      { _id: id },
      {
        $addToSet: { friendList: userId },
      },
      { upsert: true },
    );

    res.status(200).json({ message: "Usuário adicionado." });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: postAddfriend. Erro: ${error.message}`;
    }
  }
};

const getUserFriendList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as ReqUser).userId;

  try {
    const user = await User.findById({ _id: id }).populate("friendList");

    if (!user) {
      const error = new Error("Usuário não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Usuário não encontrado.";

      throw error;
    }

    res
      .status(200)
      .json({ message: "Friendlist resgatada.", data: user.friendList });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: getUserFriendList. Erro: ${error.message}`;
    }
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error: CustomError<ValidationError[]> = new Error(
      "Validação falhou.",
    );
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const id = req.params.id;
  const userData = req.body;
  const {
    email,
    password,
    first_name,
    last_name = "",
    username,
    chatId,
    friendList,
  } = userData as IUser;
  if (!id) {
    const error = new Error("Dados faltantes.") as CustomError<string[]>;
    error.statusCode = 422;
    error.data = ["id"];

    throw error;
  }
  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      const error = new Error("Usuário não encontrado") as CustomError<
        string[]
      >;
      error.statusCode = 404;
      error.data = ["Usuário não encontrado"];
      throw error;
    }
    if (user._id.toString() !== (req as ReqUser).userId) {
      const error = new Error("Não autorizado.") as CustomError<string[]>;
      error.statusCode = 403;
      error.data = ["Não autorizado."];
      throw error;
    }

    if (email) {
      user.email = email;
    }
    if (username) {
      user.username = username;
    }
    if (first_name) {
      user.first_name = first_name;
    }
    if (last_name) {
      user.last_name;
    }
    if (chatId) {
      user.chatId = chatId;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (friendList) {
      user.friendList = friendList;
    }

    const result = await user.save();

    res.status(200).json({ message: "Usuário atualizado.", user: result });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: updateUser. Erro: ${error.message}`;
    }
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    const user = await User.findById({ _id: id });

    if (!user) {
      const error = new Error("Usuário não encontrado.") as CustomError<string>;
      error.statusCode = 404;
      error.data = "Usuário não encontrado.";

      throw error;
    }
    if (user._id.toString() !== (req as ReqUser).userId) {
      const error = new Error("Não autorizado.") as CustomError<string[]>;
      error.statusCode = 403;
      error.data = ["Não autorizado."];
      throw error;
    }

    const result = await User.findByIdAndDelete({ _id: id });

    res.status(200).json({ message: "Usuário deletado.", result: result });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: deleteUser. Erro: ${error.message}`;
    }
    next(error);
  }
};

export default {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUserFriendList,
  postAddfriend,
};
