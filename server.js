import { app, httpServer, prisma } from "./init.js";
import { setChatIdOnServer } from "./lib/socketUtils.js";
import { createSocketServer } from "./socketServer.js";
import { createTelegramBot } from "./telegramBot.js";
import { getAllMessages, getChatData } from "./lib/chatUtils.js";
import { asyncHandler } from "./lib/asyncHandler.js";
import { errorHandler, corsHandler } from "./lib/errorHandler.js";
import { getCoinTickerData, getFirstAndLast20Coins } from "./lib/tokenPrice.js";
const PORT = process.env.PORT || 4000;

// create an instance of the telegram bot
const bot = createTelegramBot();

// open a connection with the client
createSocketServer(bot);

// store the telegram chatID
setChatIdOnServer(bot, prisma);

// Middleware to set CORS headers
app.use(corsHandler);

// Use the error handler middleware
app.use(errorHandler);

//using app for home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

app.get(
  "/chat",
  asyncHandler(async (req, res) => {
    const chatData = await getChatData();
    const chatTitle = chatData.title;
    res.json(chatTitle);
  })
);

app.get(
  "/messages",
  asyncHandler(async (req, res) => {
    const messages = await getAllMessages();
    res.json(messages);
  })
);

app.get(
  "/api/tokens",
  asyncHandler(async (req, res) => {
    const { firstTwentyPrices, lastTwentyPrices } =
      await getFirstAndLast20Coins();

    console.log("First 20 ->\n", firstTwentyPrices);
    console.log("Last 20 ->\n", lastTwentyPrices);

    res.json({ firstTwentyPrices, lastTwentyPrices });
  })
);

app.get(
  "/api/ticker",
  asyncHandler(async (req, res) => {
    const data = await getCoinTickerData();
    const tickerData = data.slice(0, 20);
    res.json(tickerData);
  })
);

// using http to listen on port
httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
