import express, { urlencoded } from "express";
import http from "node:http";
import { Server as IOServer, Socket } from "socket.io";
import mongoose from "mongoose";

import dotenv from "dotenv";

import userRouter from "./router/user";
import chatRouter from "./router/chat";
import messageRouter from "./router/message";
import authRouter from "./router/auth";

import type { Request, Response, NextFunction } from "express";
import type { ReqUser } from "./middleware/isAuth";
import type { Server } from "socket.io";

export interface CustomError<T> extends Error {
  statusCode?: number;
  data?: T;
}

export interface ReqUserIo extends ReqUser {
  io: Server;
}

dotenv.config();

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));

const mongouri = process.env.MONGOOSE || "error";
const port = process.env.PORT || "error";

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "*" },
});

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as ReqUserIo).io = io;
  next();
});

io.on("connection", (socket: Socket) => {
  // console.log("Novo cliente", socket.id);

  socket.on("joinRoom", (chatId: string) => {
    socket.join(chatId);
  });

  socket.on(
    "sendMessage",
    (msg: {
      chatId: string;
      _id: string;
      userId: string;
      content: string;
      timestamp: string;
    }) => {
      io.to(msg.chatId).emit("newMessage", msg);
    },
  );

  socket.on("disconnect", () => {
    // console.log("disconectado", socket.id);
  });
});

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/auth", authRouter);

app.use(
  (
    error: CustomError<void>,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const status = error.statusCode || 500;
    console.error(error.message);
    res.status(status).json({ message: error.message, data: error.data });
  },
);

mongoose.connect(mongouri).then(() => {
  server.listen(port, () => {
    console.log(`Server up on port: ${port}!`);
  });
});
