"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("../model/message");
const mongoose_1 = __importDefault(require("mongoose"));
const chat_1 = require("../model/chat");
const encryption_1 = require("../util/encryption");
const createMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const chatId = req.params.id;
    const message = req.body.message;
    try {
        const chat = yield chat_1.Chat.findById({ _id: chatId });
        if (!chat) {
            const error = new Error("Chat não encontrado.");
            error.statusCode = 404;
            error.data = "Chat não encontrado.";
            throw error;
        }
        const encryptedData = (0, encryption_1.encrypt)(message);
        const newMsg = new message_1.Message({
            content: encryptedData.content,
            iv: encryptedData.iv,
            userId: new mongoose_1.default.Types.ObjectId(userId),
            chatId: new mongoose_1.default.Types.ObjectId(chatId),
        });
        const result = yield newMsg.save();
        yield chat_1.Chat.updateOne({ _id: chatId }, {
            $push: { msgId: result._id },
        });
        req.io.to(chatId).emit("newMessage", {
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
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: createMessage. Erro: ${error.message}`;
        }
        console.error(error);
        next(error);
    }
});
const getChatMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const chat = (yield chat_1.Chat.findById({ _id: id }).populate("msgId"));
        if (!chat) {
            const error = new Error("Chat não encontrado.");
            error.statusCode = 404;
            error.data = "Chat não encontrado.";
            throw error;
        }
        if (!chat.msgId) {
            const error = new Error("Erro ao retornar as mensagens");
            error.statusCode = 422;
            error.data = "Erro ao retornar as mensagens";
            throw error;
        }
        const decryptedMessages = (chat.msgId || []).map((msg) => {
            const decryptedContent = (0, encryption_1.decrypt)(msg.content, msg.iv);
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
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: getChatMessage. Erro: ${error.message}`;
        }
        next(error);
    }
});
exports.default = {
    createMessage,
    getChatMessage,
};
