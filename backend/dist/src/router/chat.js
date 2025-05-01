"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = __importDefault(require("../controller/chat"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const router = (0, express_1.Router)();
router.post("/createchat/{:id}", isAuth_1.default, chat_1.default.createChat);
router.get("/getchat/{:name}", isAuth_1.default, chat_1.default.getChat);
router.get("/getuserchat/{:id}", isAuth_1.default, chat_1.default.getUserChat);
router.post("/joinchat/{:id}", isAuth_1.default, chat_1.default.joinChat);
router.delete("/deletechat/{:id}", isAuth_1.default, chat_1.default.deleteChat);
exports.default = router;
