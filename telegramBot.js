const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

// function to create and return a new TelegramBot instance
function createTelegramBot() {
  // assigning bot token from environment variables
  const BOT_TOKEN = process.env.BOT_TOKEN;

  // Create a bot instance
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

  return bot;
}

module.exports = { createTelegramBot };
