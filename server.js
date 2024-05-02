const { app, http, prisma } = require("./init");
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

app.get("/create", async (req, res) => {
  const chat = await prisma.chat.create({
    data: {
      title: "Chat title",
    },
  });
  res.json(chat);
});

app.get("/get", async (req, res) => {
  const chat = await prisma.chat.findMany();
  res.json(chat);
});

app.get("/api", (req, res) => {
  const serverUrl = `${req.protocol}://${req.hostname}:${PORT}`;
  res.json({ serverUrl });
});

// using http to listen on port
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
