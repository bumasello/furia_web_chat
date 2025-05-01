"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    name: String,
    desc: {
        type: String,
        required: true,
    },
    isPrivate: {
        type: Boolean,
        required: true,
    },
    creatorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    usersId: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    ],
    msgId: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            ref: "Message",
        },
    ],
}, { timestamps: true });
exports.Chat = mongoose_1.default.model("Chat", chatSchema);
