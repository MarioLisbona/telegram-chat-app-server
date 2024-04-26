const app = require("./init");
const http = require("http").Server(app);
const PORT = 4000;
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

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

app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
