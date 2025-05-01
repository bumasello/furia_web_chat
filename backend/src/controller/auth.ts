import { User } from "../model/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";
import type { CustomError } from "../app";
import type { IUser } from "../model/user";

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  let loadedUser: IUser;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Email não encontrado.") as CustomError<string[]>;
      error.statusCode = 404;
      error.data = ["Email não encontrado."];

      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Credenciais inválidas") as CustomError<string[]>;
      error.statusCode = 401;
      error.data = ["Credenciais inválidas"];

      throw error;
    }

    const secret = process.env.SEGREDO;

    if (!secret) {
      const error = new Error(
        "Dotenv não configurado corretamente.",
      ) as CustomError<string[]>;
      error.statusCode = 500;
      error.data = ["segredo"];

      throw error;
    }

    if (!loadedUser._id) {
      const error = new Error("Erro ao carregar usuário") as CustomError<
        string[]
      >;
      error.statusCode = 500;
      error.data = ["_id"];

      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
        username: loadedUser.username,
      },
      secret,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      token: token,
      user: loadedUser._id.toString(),
      username: loadedUser.username,
    });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: login. Erro: ${error.message}`;
    }
    next(error);
  }
};

export default {
  login,
};
