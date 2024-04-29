const { http } = require("./init");
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

// function to create and return a socket.io instance with a connection to the client
function createSocketServer(bot) {
  // create a socket.io connection to the client
  socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    //sends the message to all the users on the server
    socket.on("message", (data) => {
      console.log("logging messge ---->", data);
      socketIO.emit("messageResponse", data);
    });

    //Listens when a new user joins the server
    socket.on("newUser", (data) => {
      //Adds the new user to the list of users
      users.push(data);
      console.log(users);
      //Sends the list of users to the client
      socketIO.emit("newUserResponse", users);
    });

    socket.on("typing", (data) => {
      socket.broadcast.emit("typingResponse", data);
      console.log(data);
    });

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
    bot.on("message", (data) => {
      // log message
      console.log("From inside socketIO", data);
      // emit message to all connected client
      socket.emit("telegramMessage", data);
    });
  });

  return socketIO;
}

module.exports = { createSocketServer };
