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

// Middleware to set CORS headers
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://telegram-chat-app.netlify.app",
    // Add more origins if needed
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

//using app for home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

app.get("/chat", async function (req, res) {
  // find the first chat object
  const chatData = await prisma.chat.findFirst();
  const chatTitle = chatData.title;
  res.json(chatTitle);
});

app.get("/api", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const serverUrl = `${protocol}://${req.hostname}:${PORT}`;
  res.json({ serverUrl });
});

app.get("/messages", (req, res) => {
  getAllMessages()
    .then((messages) => {
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
