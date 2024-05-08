import { getCoinsList, getIdBySymbol, getPriceById } from "./tokenPrice.js";

// Event handler callback for "message"
export function handleMessage(socketIO, bot, chatId, data) {
  // Receives the message from the chat client
  // Sends the messages to all connected chat clients
  socketIO.emit("messageResponse", data);

  // sends the message to the telegram bot
  const username = data.name;
  const msg = `(${username}) - ${data.text}`;
  bot.sendMessage(chatId, msg);
}

// Event handler callback for "newUser"
export function handleNewUser(socketIO, users, data) {
  //Adds the new user to the list of users
  users.push(data);
  console.log(users);
  //Sends the list of users to the client
  socketIO.emit("newUserResponse", users);
}

// Event handler callback for "typing"
export function handleTyping(socket, data) {
  socket.broadcast.emit("typingResponse", data);
  console.log(data);
}

// Event handler callback for "disconnect"
export function handleDisconnect(socket, socketIO, users) {
  console.log("🔥: A user disconnected");
  //Updates the list of users when a user disconnects from the server
  users = users.filter((user) => user.socketID !== socket.id);
  console.log(users);
  //Sends the list of users to the client
  socketIO.emit("newUserResponse", users);
  socket.disconnect();
}

// Event handler callback for "message" from telegram bot
export async function handleTelegramMessage(socketIO, data, bot) {
  // set chat ID
  const chatId = data.chat.id;
  // create match with regex for crypto symbol e.g $eth or $eth?
  const match = data.text.match(/\$([a-zA-Z0-9]+)/);

  // send the telegram message to all connected clients
  socketIO.emit("telegramMessage", data);

  // if telegram message contains a $crypto symbol
  if (match) {
    // strip the $
    const symbol = match[1];

    // query coingecko Coins List (ID Map)
    const coinsList = await getCoinsList();

    // retrieve id from coinsList using user input symbol
    const id = getIdBySymbol(coinsList, symbol);

    // use coingecko Coin Price by ID api to get price and return message
    const priceMessage = await getPriceById(id);

    // copy the data from telegram message and update attributes accordingly
    const priceData = data;
    priceData.text = priceMessage;
    priceData.from.first_name = "Coingecko";
    priceData.from.last_name = "Price API";

    // Send the price message back to the telegram chat
    bot.sendMessage(chatId, priceMessage);

    // Send priceData object to all connected clients
    socketIO.emit("telegramMessage", priceData);
  }
}
