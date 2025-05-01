"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./router/user"));
const chat_1 = __importDefault(require("./router/chat"));
const message_1 = __importDefault(require("./router/message"));
const auth_1 = __importDefault(require("./router/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, express_1.urlencoded)({ extended: true }));
const mongouri = process.env.MONGOOSE || "error";
const port = process.env.PORT || "error";
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
const server = node_http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
app.use((req, res, next) => {
    req.io = io;
    next();
});
io.on("connection", (socket) => {
    // console.log("Novo cliente", socket.id);
    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
    });
    socket.on("sendMessage", (msg) => {
        io.to(msg.chatId).emit("newMessage", msg);
    });
    socket.on("disconnect", () => {
        // console.log("disconectado", socket.id);
    });
});
app.use("/user", user_1.default);
app.use("/chat", chat_1.default);
app.use("/message", message_1.default);
app.use("/auth", auth_1.default);
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    console.error(error.message);
    res.status(status).json({ message: error.message, data: error.data });
});
mongoose_1.default.connect(mongouri).then(() => {
    server.listen(port, () => {
        console.log(`Server up on port: ${port}!`);
    });
});
