import controller from "../src/controller/user"; // ajuste o caminho
import { User } from "../src/model/user";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

// não funcionou como eu esperava
// ainda para ser melhorado

jest.mock("../src/model/user");
jest.mock("bcrypt");
jest.mock("express-validator");

describe("User Controller", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

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

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("deve criar usuário com dados válidos", async () => {
      req.body = {
        email: "test@example.com",
        password: "123456",
        first_name: "Test",
        username: "testuser",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.prototype.save as jest.Mock).mockResolvedValue({
        _id: "userId123",
      });

      await controller.createUser(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário criado.",
        userId: "userId123",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve lançar erro se dados faltantes", async () => {
      req.body = {
        email: undefined,
        password: null,
        first_name: null,
        username: null,
      };

      await expect(controller.createUser(req, res, next)).rejects.toThrow(
        "Dados faltantes.",
      );
    });

    it("deve lançar erro se usuário já existe", async () => {
      req.body = {
        email: "test@example.com",
        password: "123456",
        first_name: "Test",
        username: "testuser",
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });

      await expect(controller.createUser(req, res, next)).rejects.toThrow(
        "Usuário cadastrado.",
      );
    });

    it("deve lançar erro se validationResult não estiver vazio", async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Erro de validação" }],
      });

      await expect(controller.createUser(req, res, next)).rejects.toThrow(
        "Validação falhou.",
      );
    });
  });

  describe("getUser", () => {
    it("deve retornar usuário pelo username", async () => {
      req.params.username = "testuser";
      (User.findOne as jest.Mock).mockResolvedValue({ username: "testuser" });

      await controller.getUser(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário resgatado.",
        users: { username: "testuser" },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve retornar erro se usuário não encontrado", async () => {
      req.params.username = "notfound";
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(controller.getUser(req, res, next)).rejects.toThrow(
        "Usuário não encontrado.",
      );
    });

    it("deve retornar todos usuários se username não informado", async () => {
      (User.find as jest.Mock).mockResolvedValue([
        { username: "user1" },
        { username: "user2" },
      ]);

      await controller.getUser(req, res, next);

      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuários resgatados.",
        users: [{ username: "user1" }, { username: "user2" }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // Você pode seguir essa estrutura para os outros métodos:
  // updateUser, deleteUser, postAddfriend, getUserFriendList
  // focando em testar fluxos principais e erros esperados.
});
