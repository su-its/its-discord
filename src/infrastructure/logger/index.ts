import dotenv from "dotenv";
import { createLogger, format, transports } from "winston";
import DiscordTransport from "./discordTransport"; // 先ほど作成した DiscordTransport

dotenv.config();

const { combine, timestamp, printf, errors, splat, colorize } = format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    splat(),
    myFormat,
  ),
  transports: [
    // コンソール出力のみ
    new transports.Console({
      format: combine(colorize(), myFormat),
    }),
    // Discord 通知用トランスポート（エラーレベルのみ）
    new DiscordTransport({
      level: "error",
      webhookUrl: process.env.DISCORD_LOG_WEBHOOK_URL || "",
    }),
  ],
  exitOnError: false,
});

export default logger;
