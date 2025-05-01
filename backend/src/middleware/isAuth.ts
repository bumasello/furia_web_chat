import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { CustomError } from "../app";

export interface ReqUser extends Request {
  userId: string;
}

const isAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auHeader = req.get("Authorization");
  if (!auHeader) {
    const error = new Error("Não autorizado.") as CustomError<string[]>;
    error.statusCode = 401;
    error.data = ["token"];

    throw error;
  }

  const token = auHeader.split(" ")[1];

  const secret = process.env.SEGREDO;

  if (!secret) {
    const error = new Error(
      "Dotenv não configurado corretamente.",
    ) as CustomError<string[]>;
    error.statusCode = 401;
    error.data = ["segredo"];

    throw error;
  }
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload | string;
    if (!decoded) {
      const error = new Error("Não autorizado.") as CustomError<string[]>;
      error.statusCode = 401;
      error.data = ["token"];

      throw error;
    }

    if (typeof decoded === "string") {
      const error = new Error("Token inválido.") as CustomError<string[]>;
      error.statusCode = 401;
      error.data = ["token"];
      throw error;
    }
    (req as ReqUser).userId = decoded.userId;
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      error.statusCode = 500;
      error.message = `Erro ao realizar a função: createUser. Erro: ${error.message}`;
    }
    next(error);
  }
  next();
};

export default isAuth;
