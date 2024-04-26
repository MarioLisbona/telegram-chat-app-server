const { http } = require("./init");
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

function createSocketServer() {
  socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("message", (msg) => {
      console.log("server got a message ", msg);

      socket.emit("message", "yoyo");
    });

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
      socket.disconnect();
    });
  });

  return socketIO;
}

module.exports = { createSocketServer };
