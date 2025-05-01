"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_1 = __importDefault(require("../controller/message"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const router = (0, express_1.Router)();
router.post("/createmessage/{:id}", isAuth_1.default, message_1.default.createMessage);
router.get("/getchatmessage/{:id}", isAuth_1.default, message_1.default.getChatMessage);
exports.default = router;
