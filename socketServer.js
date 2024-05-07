import { socketIO, prisma } from "./init.js";
import { getChatId } from "./lib/socketUtils.js";
import { handleNewUser } from "./lib/eventHandlers.js";

//setting variables for users array and telegram chat ID
let users = [];
let chatId = "";

// function to create and return a socket.io instance with a connection to the client
function createSocketServer(bot) {
  // create a socket.io connection to the client
  socketIO.on("connection", async (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // get the chat ID from the db
    chatId = await getChatId(prisma);

    // event handler call back for "messasge"
    socket.on("message", (data) => {
      // Receives the message from the chat client
      // Sends the messages to all connected chat clients
      socketIO.emit("messageResponse", data);

      // sends the message to the telegram bot
      let username = data.name;
      let msg = `(${username}) - ${data.text}`;
      bot.sendMessage(chatId, msg);
    });

    //event handler for when a new user joins the server
    socket.on("newUser", (data) => {
      handleNewUser(socketIO, users, data);
    });

    // event handler for a user typing in the chat client
    socket.on("typing", (data) => {
      socket.broadcast.emit("typingResponse", data);
      console.log(data);
    });

    // event handler for a client disconnecting from the chat client
    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
      //Updates the list of users when a user disconnects from the server
      users = users.filter((user) => user.socketID !== socket.id);
      console.log(users);
      //Sends the list of users to the client
      socketIO.emit("newUserResponse", users);
      socket.disconnect();
    });

    // event handler to receive "message" from telegram bot
    bot.on("message", async (data) => {
      // emit message to all connected clients
      socket.emit("telegramMessage", data);
    });
  });

  return socketIO;
}

export { createSocketServer };
