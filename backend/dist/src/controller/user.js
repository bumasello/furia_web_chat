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
const express_validator_1 = require("express-validator");
const user_1 = require("../model/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validação falhou.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const userData = req.body;
    const { email, password, first_name, last_name = "", username } = userData;
    try {
        if (!email || !password || !first_name || !username) {
            const error = new Error("Dados faltantes.");
            error.statusCode = 422;
            error.data = ["email", "password", "first_name", "username"];
            throw error;
        }
        const existingUser = yield user_1.User.findOne({ email: userData.email });
        if (existingUser) {
            const error = new Error("Usuário cadastrado.");
            error.statusCode = 422;
            error.data = "Usuário já cadastrado.";
            throw error;
        }
        const hashedPwd = yield bcrypt_1.default.hash(password, 10);
        const user = new user_1.User({
            email,
            first_name,
            last_name,
            username,
            password: hashedPwd,
        });
        const result = yield user.save();
        res.status(201).json({ message: "Usuário criado.", userId: result._id });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: createUser. Erro: ${error.message}`;
        }
        next(error);
    }
});
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username || undefined;
    try {
        if (username) {
            const user = yield user_1.User.findOne({ username: username });
            if (!user) {
                const error = new Error("Usuário não encontrado.");
                error.statusCode = 404;
                error.data = "Usuário não encontrado.";
                throw error;
            }
            res.status(200).json({ message: "Usuário resgatado.", users: user });
            return;
        }
        const users = yield user_1.User.find();
        res.status(200).json({ message: "Usuários resgatados.", users: users });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: getUser. Erro: ${error.message}`;
        }
        next(error);
    }
});
const postAddfriend = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id || undefined;
    const userId = req.userId;
    try {
        const userFriend = yield user_1.User.findById({ _id: id });
        if (!userFriend) {
            const error = new Error("Amigo não encontrado.");
            error.statusCode = 404;
            error.data = "Amigo não encontrado.";
            throw error;
        }
        const user = yield user_1.User.findById({ _id: userId });
        if (!user) {
            const error = new Error("Usuário não encontrado.");
            error.statusCode = 422;
            error.data = "Usuário não encontrado.";
            throw error;
        }
        yield user_1.User.updateOne({ _id: userId }, {
            $addToSet: { friendList: id },
        }, { upsert: true });
        yield user_1.User.updateOne({ _id: id }, {
            $addToSet: { friendList: userId },
        }, { upsert: true });
        res.status(200).json({ message: "Usuário adicionado." });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: postAddfriend. Erro: ${error.message}`;
        }
    }
});
const getUserFriendList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.userId;
    try {
        const user = yield user_1.User.findById({ _id: id }).populate("friendList");
        if (!user) {
            const error = new Error("Usuário não encontrado.");
            error.statusCode = 404;
            error.data = "Usuário não encontrado.";
            throw error;
        }
        res
            .status(200)
            .json({ message: "Friendlist resgatada.", data: user.friendList });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: getUserFriendList. Erro: ${error.message}`;
        }
        next(error);
    }
});
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validação falhou.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const id = req.params.id;
    const userData = req.body;
    const { email, password, first_name, last_name = "", username, chatId, friendList, } = userData;
    if (!id) {
        const error = new Error("Dados faltantes.");
        error.statusCode = 422;
        error.data = ["id"];
        throw error;
    }
    try {
        const user = yield user_1.User.findOne({ _id: id });
        if (!user) {
            const error = new Error("Usuário não encontrado");
            error.statusCode = 404;
            error.data = ["Usuário não encontrado"];
            throw error;
        }
        if (user._id.toString() !== req.userId) {
            const error = new Error("Não autorizado.");
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
            user.password = yield bcrypt_1.default.hash(password, 10);
        }
        if (friendList) {
            user.friendList = friendList;
        }
        const result = yield user.save();
        res.status(200).json({ message: "Usuário atualizado.", user: result });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: updateUser. Erro: ${error.message}`;
        }
        next(error);
    }
});
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const user = yield user_1.User.findById({ _id: id });
        if (!user) {
            const error = new Error("Usuário não encontrado.");
            error.statusCode = 404;
            error.data = "Usuário não encontrado.";
            throw error;
        }
        if (user._id.toString() !== req.userId) {
            const error = new Error("Não autorizado.");
            error.statusCode = 403;
            error.data = ["Não autorizado."];
            throw error;
        }
        const result = yield user_1.User.findByIdAndDelete({ _id: id });
        res.status(200).json({ message: "Usuário deletado.", result: result });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: deleteUser. Erro: ${error.message}`;
        }
        next(error);
    }
});
exports.default = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getUserFriendList,
    postAddfriend,
};
