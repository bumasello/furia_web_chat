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
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../model/user");
const chat_1 = require("../model/chat");
const createChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const creatorId = req.userId;
    const chatType = req.body.desc;
    let chatPayload = {
        creatorId: new mongoose_1.default.Types.ObjectId(creatorId),
        isPrivate: true,
        usersId: [creatorId],
    };
    try {
        if (chatType === "private") {
            const friendId = req.params.id;
            if (!friendId) {
                const error = new Error("Id do amigo é necessário para iniciar o chat.");
                error.statusCode = 400;
                error.data = "Id do amigo é necessário para iniciar o chat.";
                throw error;
            }
            const friend = yield user_1.User.findById({ _id: friendId });
            if (!friend) {
                const error = new Error("Usuário não encontrado.");
                error.statusCode = 404;
                error.data = "Usuário não encontrado.";
                throw error;
            }
            const existingPrivateChat = yield chat_1.Chat.findOne({
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
            (_a = chatPayload.usersId) === null || _a === void 0 ? void 0 : _a.push(friendId);
            chatPayload.name = req.body.name;
            chatPayload.desc = req.body.desc;
            chatPayload.isPrivate = true;
            const chat = new chat_1.Chat(chatPayload);
            const result = yield chat.save();
            yield user_1.User.updateOne({ _id: creatorId }, {
                $addToSet: { chatId: result._id },
            }, { upsert: true });
            yield user_1.User.updateOne({ _id: friendId }, {
                $addToSet: { chatId: result._id },
            }, { upsert: true });
            res.status(201).json({
                message: "Chat privado criado com sucesso.",
                data: result,
            });
            return;
        }
        if (chatType === "group") {
            if (Array.isArray(req.body.usersId)) {
                for (const userId of req.body.usersId) {
                    if (!((_b = chatPayload.usersId) === null || _b === void 0 ? void 0 : _b.includes(userId))) {
                        (_c = chatPayload.usersId) === null || _c === void 0 ? void 0 : _c.push(userId);
                    }
                }
            }
            chatPayload.name = req.body.name || "Novo Grupo";
            chatPayload.desc = req.body.desc || "Chat em grupo";
            chatPayload.isPrivate = (_d = req.body.isPrivate) !== null && _d !== void 0 ? _d : false;
            const chat = new chat_1.Chat(chatPayload);
            const result = yield chat.save();
            const updatePromises = (_e = chatPayload.usersId) === null || _e === void 0 ? void 0 : _e.map((userId) => user_1.User.updateOne({ _id: userId }, { $addToSet: { chatId: result._id } }, { upsert: true }));
            if (updatePromises) {
                yield Promise.all(updatePromises);
            }
            res.status(201).json({
                message: "Chat em grupo criado com sucesso.",
                data: result,
            });
            return;
        }
        // erro
        const error = new Error("Tipo de chat inválido.");
        error.statusCode = 400;
        error.data = "Tipo de chat inválido. Use 'private' ou 'group'.";
        throw error;
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: createChat. Erro: ${error.message}`;
        }
        next(error);
    }
});
const joinChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const userId = req.userId;
    try {
        const chat = yield chat_1.Chat.findById({ _id: id });
        if (!chat) {
            const error = new Error("Chat não encontrado.");
            error.statusCode = 404;
            error.data = "Chat não encontrado.";
            throw error;
        }
        yield user_1.User.updateOne({ _id: userId }, { $addToSet: { chatId: chat._id } }, { upsert: true });
        res
            .status(201)
            .json({ message: "Chat adicionado com sucesso.", data: chat });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: joinChat. Erro: ${error.message}`;
        }
        next(error);
    }
});
const getChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.params.name || undefined;
    try {
        if (name) {
            const chat = yield chat_1.Chat.findOne({ name: name });
            if (!chat) {
                const error = new Error("Chat não encontrado.");
                error.statusCode = 404;
                error.data = "Chat não encontrado.";
                throw error;
            }
            res.status(200).json({ message: "Chat resgatado.", chat: chat });
            return;
        }
        const chat = yield chat_1.Chat.find({ desc: "group", isPrivate: false });
        res
            .status(200)
            .json({ message: "Chats resgatado.", chat: chat, oi: "oie" });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: getChat. Erro: ${error.message}`;
        }
        next(error);
    }
});
const getUserChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id || undefined;
    try {
        const user = yield user_1.User.findById({ _id: id }).populate("chatId");
        if (!user) {
            const error = new Error("User não encontrado.");
            error.statusCode = 404;
            error.data = "User não encontrado.";
            throw error;
        }
        const chats = user.chatId;
        res.status(200).json({ message: "Chats resgatados.", chats: chats });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: getUserChat. Erro: ${error.message}`;
        }
        next(error);
    }
});
const deleteChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const chat = yield chat_1.Chat.findById({ _id: id });
        if (!chat) {
            const error = new Error("Chat não encontrado.");
            error.statusCode = 404;
            error.data = "Chat não encontrado.";
            throw error;
        }
        if (chat.creatorId.toString() !== req.userId) {
            const error = new Error("Não autorizado.");
            error.statusCode = 403;
            error.data = ["Não autorizado."];
            throw error;
        }
        const result = yield chat_1.Chat.findByIdAndDelete({ _id: id });
        if (!result) {
            const error = new Error("Erro ao deletar chat.");
            error.statusCode = 500;
            error.data = "Erro ao deletar chat.";
            throw error;
        }
        yield user_1.User.updateMany({ chatId: result._id }, { $pull: { chatId: result._id } });
        res
            .status(200)
            .json({ message: "Chat deletado com sucesso.", result: result });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: deleteChat. Erro: ${error.message}`;
        }
        next(error);
    }
});
exports.default = {
    createChat,
    deleteChat,
    getChat,
    joinChat,
    getUserChat,
};
