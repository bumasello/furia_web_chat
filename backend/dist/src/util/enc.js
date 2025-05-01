"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt2 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const key = crypto_1.default.randomBytes(32).toString("base64");
const encrypt2 = (text) => {
    const iv = crypto_1.default.randomBytes(12).toString("base64");
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", Buffer.from(key, "base64"), Buffer.from(iv, "base64"));
    let ciphertext = cipher.update(text, "utf8", "base64");
    ciphertext += cipher.final("base64");
    const tag = cipher.getAuthTag();
    return { ciphertext, : .toString(), tag, : .toString() };
};
exports.encrypt2 = encrypt2;
