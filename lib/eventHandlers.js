import { handleTokenQuery } from "./tokenPrice.js";
import { prisma } from "../init.js";
import { convertToISO8601, saveMessageToDb } from "./chatUtils.js";
import { handleMatchCryptoToken } from "./chatUtils.js";

// Event handler callback for "message"
export const handleMessage = async (socketIO, bot, chatId, data) => {
  try {
    // Receives the message from the chat client
    // Sends the messages to all connected chat clients
    socketIO.emit("messageResponse", data);

    // add sentFrom information to data object
    data.sentFrom = "chat client";
    // format datetime
    data.datetime = convertToISO8601(data.datetime);

    // write the message to PSQL
    saveMessageToDb(data);

    // create match with regex for crypto symbol e.g $eth or $eth?
    const match = data.text.match(/\$([a-zA-Z0-9]+)/);

    // sends the message to the telegram bot
    const username = data.name;
    const msg = `(${username}) - ${data.text}`;
    bot.sendMessage(chatId, msg);

    // if telegram message contains a $crypto symbol
    if (match) {
      handleMatchCryptoToken(match, bot, socketIO, chatId, true);
    }
  } catch (error) {
    console.error("Error handling client message:", error);
  }
};

// Event handler callback for "message" from telegram bot
export const handleTelegramMessage = async (chatId, socketIO, data, bot) => {
  try {
    // create match with regex for crypto symbol e.g $eth or $eth?
    const match = data.text.match(/\$([a-zA-Z0-9]+)/);

    // datetime for now
    const now = new Date();

    // create object to match structure of cleint messages
    const telegramMessage = {
      text: data.text,
      name: `(telegram) ${data.from.first_name} ${data.from.last_name}`,
      userId: data.from.id.toString(),
      socketID: "undefined",
      datetime: now,
    };

    // send the telegram message to all connected clients
    socketIO.emit("telegramMessage", telegramMessage);

    // add sentFrom information to data object
    telegramMessage.sentFrom = "telegram application";

    // write the message to PSQL
    saveMessageToDb(telegramMessage);

    // if telegram message contains a $crypto symbol
    if (match) {
      handleMatchCryptoToken(match, bot, socketIO, chatId);
    }
  } catch (error) {
    console.error("Error handling Telegram message:", error);
  }
};

// Event handler callback for "typing"
export const handleTyping = (socket, data) => {
  try {
    socket.broadcast.emit("typingResponse", data);
  } catch (error) {
    console.error("Error handling typing event:", error);
  }
};

// Event handler callback for "disconnect"
export const handleDisconnect = (socket, socketIO) => {
  try {
    console.log(`🔥: ${socket.id} disconnected`);
    socket.disconnect();
  } catch (error) {
    console.error("Error handling disconnect event:", error);
  }
};
