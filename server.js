const { app, http } = require("./init");
const { createSocketServer } = require("./socketServer");
const { createTelegramBot } = require("./telegramBot");
const PORT = process.env.PORT || 4000;

// create an instance of the telegram bot
const bot = createTelegramBot();

// open a connection with the client
createSocketServer(bot);

//using app for home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

// using http to listen on port
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
