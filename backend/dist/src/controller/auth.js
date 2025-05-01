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
const user_1 = require("../model/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    let loadedUser;
    try {
        const user = yield user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error("Email não encontrado.");
            error.statusCode = 404;
            error.data = ["Email não encontrado."];
            throw error;
        }
        loadedUser = user;
        const isEqual = yield bcrypt_1.default.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Credenciais inválidas");
            error.statusCode = 401;
            error.data = ["Credenciais inválidas"];
            throw error;
        }
        const secret = process.env.SEGREDO;
        if (!secret) {
            const error = new Error("Dotenv não configurado corretamente.");
            error.statusCode = 500;
            error.data = ["segredo"];
            throw error;
        }
        if (!loadedUser._id) {
            const error = new Error("Erro ao carregar usuário");
            error.statusCode = 500;
            error.data = ["_id"];
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            username: loadedUser.username,
        }, secret, { expiresIn: "1h" });
        res.status(200).json({
            token: token,
            user: loadedUser._id.toString(),
            username: loadedUser.username,
        });
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: login. Erro: ${error.message}`;
        }
        next(error);
    }
});
exports.default = {
    login,
};
