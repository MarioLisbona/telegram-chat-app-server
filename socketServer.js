import { socketIO, prisma } from "./init.js";
import { getChatId } from "./lib/socketUtils.js";
import {
  handleMessage,
  handleTyping,
  handleDisconnect,
  handleTelegramMessage,
} from "./lib/eventHandlers.js";

//setting variable for telegram chat ID

let chatId = "";

// function to create and return a socket.io instance with a connection to the client
export function createSocketServer(bot) {
  // create a socket.io connection to the client
  socketIO.on("connection", async (socket) => {
    try {
      // connection message logged for each new client connection
      console.log(`⚡: ${socket.id} user just connected!`);

      // get the chat ID from the db
      chatId = await getChatId(prisma);

      // event handler for messages received from the clients
      socket.on("message", (data) => {
        handleMessage(socketIO, bot, chatId, data);
      });

      // event handler for a user typing in the chat client
      socket.on("typing", (data) => {
        handleTyping(socket, data);
      });

      // event handler for a client disconnecting from the chat client
      socket.on("disconnect", () => {
        handleDisconnect(socket, socketIO);
      });
    } catch (error) {
      console.error("Error during socket connection:", error);
      socket.emit("error", "Internal Server Error");
    }
  });

  // event handler to receive "message" from telegram bot
  bot.on("message", async (data) => {
    try {
      handleTelegramMessage(chatId, socketIO, data, bot);
    } catch (error) {
      console.error("Error handling Telegram message:", error);
      // Handle the error appropriately
    }
  });
}
