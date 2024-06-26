import TelegramBot from "node-telegram-bot-api";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

// function to create and return a new TelegramBot instance
export const createTelegramBot = () => {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;

    // Create a bot instance
    const bot = new TelegramBot(BOT_TOKEN, { polling: true });

    return bot;
  } catch (error) {
    console.error("Error in createTelegramBot:", error);
    return { msg: `Error creating Telegram Bot: ${error.message}` };
  }
};
