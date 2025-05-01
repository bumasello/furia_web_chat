"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./router/user"));
const chat_1 = __importDefault(require("./router/chat"));
const message_1 = __importDefault(require("./router/message"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const mongouri = process.env.MONGOOSE || "error";
const port = process.env.PORT || "error";
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use("/user", user_1.default);
app.use("/chat", chat_1.default);
app.use("/message", message_1.default);
app.use((error, req, res, next) => {
    const status = error.status || 500;
    console.error(error.name);
    res.status(status).json({ message: error.message });
});
mongoose_1.default.connect(mongouri).then(() => {
    app.listen(port, () => {
        console.log(`Server up on port: ${port}!`);
    });
});
