import { handleTokenQuery } from "./tokenPrice.js";
import { prisma } from "../init.js";
import {
  convertToISO8601,
  saveMessageToDb,
  createTelegramMessage,
  handleMatchCryptoToken,
} from "./chatUtils.js";

// Event handler callback for "message"
export const handleMessage = async (socketIO, bot, chatId, data) => {
  try {
    // Receives the message from the chat client
    // Sends the messages to all connected chat clients
    socketIO.emit("messageResponse", data);

    // add sentFrom information to data object
    data.sentFrom = "chat client";
    // format createdAt
    data.createdAt = convertToISO8601(data.createdAt);

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

export const handleTokenClick = (socketIO, data, bot, chatId) => {
  // Create message object from token click
  // Leaving coin data commented out for the moment
  const messageObject = {
    text: `Look at the price of ${
      data.coin.name
    }!\nIt just hit $USD ${data.coin.current_price.toFixed(
      2
    )}, a change of %${data.coin.price_change_percentage_24h.toFixed(
      2
    )}\nIts market cap is now $USD ${data.coin.market_cap} `,
    // coin: data.coin,
    name: data.name,
    userId: data.userId,
    socketID: data.socketID,
    createdAt: data.createdAt,
  };

  // add sentFrom information to data object
  messageObject.sentFrom = "chat client";
  // format createdAt
  messageObject.createdAt = convertToISO8601(data.createdAt);

  // write the message to PSQL
  saveMessageToDb(messageObject);

  // send the token click info to all the connected clients
  socketIO.emit("tokenClickResponse", messageObject);

  // create message to send back to the telegram chat
  // TODO: This can use the coin data to perhaps create a screen shot or graph
  const msg = `(${messageObject.name}) - ${messageObject.text}`;
  bot.sendMessage(chatId, msg);
};

// Event handler callback for "message" from telegram bot
export const handleTelegramMessage = async (chatId, socketIO, data, bot) => {
  console.log("Logging telegram message", data);

  try {
    // create match with regex for crypto symbol e.g $eth or $eth?
    const match = data.text.match(/\$([a-zA-Z0-9]+)/);

    const name = `(telegram) ${data.from.first_name} ${data.from.last_name}`;
    const text = data.text;
    const userId = data.from.id.toString();

    // create message to send to clients
    const telegramMessage = createTelegramMessage(text, name, userId);

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
    // adding conditionals to catch
    // this will conditionally render a message to the client tha a user has joined or left the chat or log an error to the server
    if (data.left_chat_member) {
      const user =
        data.left_chat_member.first_name +
        " " +
        data.left_chat_member.last_name;
      const text = `${user} left the chat`;
      const name = "telegram-chat-server";
      const userId = data.from.id.toString();

      // create message to send to clients
      const telegramMessage = createTelegramMessage(text, name, userId);

      // send the telegram message to all connected clients
      socketIO.emit("telegramMessage", telegramMessage);

      // add sentFrom information to data object
      telegramMessage.sentFrom = "telegram application notifications";

      // write the message to PSQL
      saveMessageToDb(telegramMessage);
    } else if (data.new_chat_member) {
      const user =
        data.new_chat_member.first_name + " " + data.new_chat_member.last_name;
      const text = `${user} joined the chat`;
      const name = "telegram-chat-server";
      const userId = data.from.id.toString();

      // create message to send to clients
      const telegramMessage = createTelegramMessage(text, name, userId);

      // send the telegram message to all connected clients
      socketIO.emit("telegramMessage", telegramMessage);

      // add sentFrom information to data object
      telegramMessage.sentFrom = "telegram application notifications";

      // write the message to PSQL
      saveMessageToDb(telegramMessage);
    } else {
      console.error("Error handling Telegram message:", error);
    }
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
export const handleDisconnect = (socket) => {
  try {
    console.log(`🔥: ${socket.id} disconnected`);
    socket.disconnect();
  } catch (error) {
    console.error("Error handling disconnect event:", error);
  }
};
