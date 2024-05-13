import { app, httpServer, prisma } from "./init.js";
import { setChatIdOnServer } from "./lib/socketUtils.js";
import { createSocketServer } from "./socketServer.js";
import { createTelegramBot } from "./telegramBot.js";
import { getAllMessages } from "./lib/chatUtils.js";
const PORT = process.env.PORT || 4000;

// create an instance of the telegram bot
const bot = createTelegramBot();

// open a connection with the client
createSocketServer(bot);

// store the telegram chatID
setChatIdOnServer(bot, prisma);

//using app for home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

// Only being userd to test chat ID object returned from PSQL
app.get("/get", async (req, res) => {
  const chats = await prisma.chat.findMany();

  // Convert BigInt values to strings, handling null values
  const serializedChats = chats.map((chat) => ({
    ...chat,
    chatId: chat.chatId !== null ? chat.chatId.toString() : null, // Convert chatId to string if not null
  }));

  res.json(serializedChats);
});

app.get("/api", (req, res) => {
  const serverUrl = `${req.protocol}://${req.hostname}:${PORT}`;
  res.json({ serverUrl });
});

app.get("/messages", (req, res) => {
  getAllMessages()
    .then((messages) => {
      console.log("All messages:", messages);
      res.json(messages);
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
    });
});

// using http to listen on port
httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
