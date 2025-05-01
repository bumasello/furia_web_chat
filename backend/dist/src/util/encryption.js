"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envkey = process.env.CRYPTO_KEY || "error";
const algorithm = "aes-256-cbc";
const key = Buffer.from(envkey, "hex"); // 32 bytes
const iv = crypto_1.default.randomBytes(16); // 16 bytes IV
function encrypt(text) {
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { content: encrypted, iv: iv.toString("hex") };
}
function decrypt(encryptedData, ivHex) {
    const ivBuffer = Buffer.from(ivHex, "hex");
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
