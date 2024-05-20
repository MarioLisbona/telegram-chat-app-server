import { app, httpServer, prisma } from "./init.js";
import { setChatIdOnServer } from "./lib/socketUtils.js";
import { createSocketServer } from "./socketServer.js";
import { createTelegramBot } from "./telegramBot.js";
import { getAllMessages } from "./lib/chatUtils.js";
import { asyncHandler } from "./lib/asyncHandler.js";
import { errorHandler } from "./lib/errorHandler.js";
const PORT = process.env.PORT || 4000;

// create an instance of the telegram bot
const bot = createTelegramBot();

// open a connection with the client
createSocketServer(bot);

// store the telegram chatID
setChatIdOnServer(bot, prisma);

// Middleware to set CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Change * to the specific origin if needed
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Use the error handler middleware
app.use(errorHandler);

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

app.get(
  "/messages",
  asyncHandler(async (req, res) => {
    const messages = await getAllMessages();
    res.json(messages);
  })
);

// using http to listen on port
httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
