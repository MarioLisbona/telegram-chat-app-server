const { http } = require("./init");
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// function to create and return a socket.io instance with a connection to the client
function createSocketServer(bot) {
  // create a socket.io connection to the client
  socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // event handler to receive "message"
    socket.on("message", (msg) => {
      // log message
      console.log("server got a message ", msg);

      // emit message to all connected client
      socket.emit("message", "yoyo");
    });

    // event handler for client disconnecting
    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
      socket.disconnect();
    });

    // event handler to receive "message" from telegram bot
    bot.on("message", (msg) => {
      // log message
      console.log("From inside socketIO", msg);
      // emit message to all connected client
      socket.emit("message", msg);
    });
  });

  return socketIO;
}

module.exports = { createSocketServer };
