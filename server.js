import { app, httpServer, prisma } from "./init.js";
import { createSocketServer } from "./socketServer.js";
import { createTelegramBot } from "./telegramBot.js";
const PORT = process.env.PORT || 4000;

// create an instance of the telegram bot
const bot = createTelegramBot();

// open a connection with the client
createSocketServer(bot);

//using app for home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

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

// using http to listen on port
httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
