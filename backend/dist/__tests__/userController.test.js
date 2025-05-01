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
const user_1 = __importDefault(require("../src/controller/user")); // ajuste o caminho
const user_2 = require("../src/model/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_validator_1 = require("express-validator");
// não funcionou como eu esperava
// ainda para ser melhorado
jest.mock("../src/model/user");
jest.mock("bcrypt");
jest.mock("express-validator");
describe("User Controller", () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        express_validator_1.validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("createUser", () => {
        it("deve criar usuário com dados válidos", () => __awaiter(void 0, void 0, void 0, function* () {
            req.body = {
                email: "test@example.com",
                password: "123456",
                first_name: "Test",
                username: "testuser",
            };
            user_2.User.findOne.mockResolvedValue(null);
            bcrypt_1.default.hash.mockResolvedValue("hashedpassword");
            user_2.User.prototype.save.mockResolvedValue({
                _id: "userId123",
            });
            yield user_1.default.createUser(req, res, next);
            expect(user_2.User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
            expect(bcrypt_1.default.hash).toHaveBeenCalledWith("123456", 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Usuário criado.",
                userId: "userId123",
            });
            expect(next).not.toHaveBeenCalled();
        }));
        it("deve lançar erro se dados faltantes", () => __awaiter(void 0, void 0, void 0, function* () {
            req.body = {
                email: undefined,
                password: null,
                first_name: null,
                username: null,
            };
            yield expect(user_1.default.createUser(req, res, next)).rejects.toThrow("Dados faltantes.");
        }));
        it("deve lançar erro se usuário já existe", () => __awaiter(void 0, void 0, void 0, function* () {
            req.body = {
                email: "test@example.com",
                password: "123456",
                first_name: "Test",
                username: "testuser",
            };
            user_2.User.findOne.mockResolvedValue({
                email: "test@example.com",
            });
            yield expect(user_1.default.createUser(req, res, next)).rejects.toThrow("Usuário cadastrado.");
        }));
        it("deve lançar erro se validationResult não estiver vazio", () => __awaiter(void 0, void 0, void 0, function* () {
            express_validator_1.validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: "Erro de validação" }],
            });
            yield expect(user_1.default.createUser(req, res, next)).rejects.toThrow("Validação falhou.");
        }));
    });
    describe("getUser", () => {
        it("deve retornar usuário pelo username", () => __awaiter(void 0, void 0, void 0, function* () {
            req.params.username = "testuser";
            user_2.User.findOne.mockResolvedValue({ username: "testuser" });
            yield user_1.default.getUser(req, res, next);
            expect(user_2.User.findOne).toHaveBeenCalledWith({ username: "testuser" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Usuário resgatado.",
                users: { username: "testuser" },
            });
            expect(next).not.toHaveBeenCalled();
        }));
        it("deve retornar erro se usuário não encontrado", () => __awaiter(void 0, void 0, void 0, function* () {
            req.params.username = "notfound";
            user_2.User.findOne.mockResolvedValue(null);
            yield expect(user_1.default.getUser(req, res, next)).rejects.toThrow("Usuário não encontrado.");
        }));
        it("deve retornar todos usuários se username não informado", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.User.find.mockResolvedValue([
                { username: "user1" },
                { username: "user2" },
            ]);
            yield user_1.default.getUser(req, res, next);
            expect(user_2.User.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Usuários resgatados.",
                users: [{ username: "user1" }, { username: "user2" }],
            });
            expect(next).not.toHaveBeenCalled();
        }));
    });
    // Você pode seguir essa estrutura para os outros métodos:
    // updateUser, deleteUser, postAddfriend, getUserFriendList
    // focando em testar fluxos principais e erros esperados.
});
