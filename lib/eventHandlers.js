import { handleTokenQuery } from "./tokenPrice.js";
import { prisma } from "../init.js";
import { convertToISO8601, saveMessageToDb } from "./chatUtils.js";
import { handleMatchCryptoToken } from "./chatUtils.js";

// Event handler callback for "message"
export async function handleMessage(socketIO, bot, chatId, data) {
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
}

// Event handler callback for "message" from telegram bot
export async function handleTelegramMessage(chatId, socketIO, data, bot) {
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
}

// Event handler callback for "typing"
export function handleTyping(socket, data) {
  socket.broadcast.emit("typingResponse", data);
}

// Event handler callback for "disconnect"
export function handleDisconnect(socket, socketIO) {
  console.log(`🔥: ${socket.id} disconnected`);
  socket.disconnect();
}
