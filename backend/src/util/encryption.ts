import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const envkey = process.env.CRYPTO_KEY || "error";

const algorithm = "aes-256-cbc";
const key = Buffer.from(envkey, "hex"); // 32 bytes
const iv = crypto.randomBytes(16); // 16 bytes IV

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { content: encrypted, iv: iv.toString("hex") };
}

export function decrypt(encryptedData: string, ivHex: string) {
  const ivBuffer = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
