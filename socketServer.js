import { socketIO, prisma } from "./init.js";
import { getChatId } from "./lib/socketUtils.js";
import {
  handleMessage,
  handleNewUser,
  handleTyping,
  handleDisconnect,
} from "./lib/eventHandlers.js";

//setting variables for users array and telegram chat ID
let users = [];
let chatId = "";

// function to create and return a socket.io instance with a connection to the client
function createSocketServer(bot) {
  // create a socket.io connection to the client
  socketIO.on("connection", async (socket) => {
    // connection message logged for each new client connection
    console.log(`⚡: ${socket.id} user just connected!`);

    // get the chat ID from the db
    chatId = await getChatId(prisma);

    // event handler for messages received from the clients
    socket.on("message", (data) => {
      handleMessage(socketIO, bot, chatId, data);
    });

    //event handler for when a new user joins the server
    socket.on("newUser", (data) => {
      handleNewUser(socketIO, users, data);
    });

    // event handler for a user typing in the chat client
    socket.on("typing", (data) => {
      handleTyping(socket, data);
    });

    // event handler for a client disconnecting from the chat client
    socket.on("disconnect", () => {
      handleDisconnect(socket, socketIO, users);
    });

    // event handler to receive "message" from telegram bot
    bot.on("message", async (data) => {
      handleTelegramMessage(socket, data);
    });
  });

  return socketIO;
}

export { createSocketServer };
