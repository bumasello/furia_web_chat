"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    const auHeader = req.get("Authorization");
    if (!auHeader) {
        const error = new Error("Não autorizado.");
        error.statusCode = 401;
        error.data = ["token"];
        throw error;
    }
    const token = auHeader.split(" ")[1];
    const secret = process.env.SEGREDO;
    if (!secret) {
        const error = new Error("Dotenv não configurado corretamente.");
        error.statusCode = 401;
        error.data = ["segredo"];
        throw error;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded) {
            const error = new Error("Não autorizado.");
            error.statusCode = 401;
            error.data = ["token"];
            throw error;
        }
        if (typeof decoded === "string") {
            const error = new Error("Token inválido.");
            error.statusCode = 401;
            error.data = ["token"];
            throw error;
        }
        req.userId = decoded.userId;
    }
    catch (error) {
        if (error instanceof Error && "statusCode" in error) {
            error.statusCode = 500;
            error.message = `Erro ao realizar a função: createUser. Erro: ${error.message}`;
        }
        next(error);
    }
    next();
};
exports.default = isAuth;
