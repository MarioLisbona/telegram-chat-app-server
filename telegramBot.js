import TelegramBot from "node-telegram-bot-api";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

// function to create and return a new TelegramBot instance
export const createTelegramBot = () => {
  const env = process.env.NODE_ENV;
  // assigning bot token from environment variables
  const BOT_TOKEN =
    env === "development" ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

  // Create a bot instance
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

  return bot;
};
