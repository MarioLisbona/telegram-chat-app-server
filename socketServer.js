const { socketIO, prisma } = require("./init");

//setting variables for users array and telegram chat ID
let users = [];
let ChatId = "";

// function to create and return a socket.io instance with a connection to the client
function createSocketServer(bot) {
  // create a socket.io connection to the client
  socketIO.on("connection", async (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // rfind the first chat object
    const chatData = await prisma.chat.findFirst();
    // assign chat ID to variable
    ChatId = chatData.chatId;

    // event handler call back for "messasge"
    socket.on("message", (data) => {
      // Receives the message from the chat client
      // Sends the messages to all connected chat clients
      socketIO.emit("messageResponse", data);

      // sends the message to the telegram bot
      username = data.name;
      msg = `(${username}) - ${data.text}`;
      bot.sendMessage(ChatId, msg);
    });

    //event handler for when a new user joins the server
    socket.on("newUser", (data) => {
      //Adds the new user to the list of users
      users.push(data);
      console.log(users);
      //Sends the list of users to the client
      socketIO.emit("newUserResponse", users);
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
      // set the chat ID - require to replay client msgs back to telegram bot
      ChatId = data.chat.id;
      chatTitle = data.chat.title;

      // retreive the array of chat objects
      const chats = await prisma.chat.findMany();

      // if the chats array is empty assign the chat Id
      // This will only create a single record for this chat
      if (chats.length == 0) {
        const chat = await prisma.chat.create({
          data: {
            chatId: ChatId,
            title: chatTitle,
          },
        });
      }

      // emit message to all connected clients
      socket.emit("telegramMessage", data);
    });
  });

  return socketIO;
}

module.exports = { createSocketServer };
