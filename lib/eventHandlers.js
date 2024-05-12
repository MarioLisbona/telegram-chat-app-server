import { handleTokenQuery } from "./tokenPrice.js";

// Event handler callback for "message"
export async function handleMessage(socketIO, bot, chatId, data) {
  // Receives the message from the chat client
  // Sends the messages to all connected chat clients
  socketIO.emit("messageResponse", data);

  // create match with regex for crypto symbol e.g $eth or $eth?
  const match = data.text.match(/\$([a-zA-Z0-9]+)/);

  // sends the message to the telegram bot
  const username = data.name;
  const msg = `(${username}) - ${data.text}`;
  bot.sendMessage(chatId, msg);

  // if telegram message contains a $crypto symbol
  if (match) {
    // return the current price for the token query string
    const returnedData = await handleTokenQuery(match);

    // copy the data from telegram message and update attributes accordingly
    const priceData = data;
    priceData.text = returnedData.msg;
    priceData["first_name"] = "Coingecko";
    priceData["last_name"] = "Price API";

    // // Send the price message back to the telegram chat
    bot.sendMessage(chatId, returnedData.msg);

    // Send priceData object to all connected clients
    socketIO.emit("messageResponse", priceData);
  }
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
  console.log(`🔥: ${socket.id} disconnected`);

  //Updates the list of users when a user disconnects from the server
  users = users.filter((user) => user.socketID !== socket.id);
  console.log(users);

  //Sends the list of users to the client
  socketIO.emit("newUserResponse", users);
  socket.disconnect();
}

// Event handler callback for "message" from telegram bot
export async function handleTelegramMessage(chatId, socketIO, data, bot) {
  // create match with regex for crypto symbol e.g $eth or $eth?
  const match = data.text.match(/\$([a-zA-Z0-9]+)/);

  // datetime for now
  const now = new Date();

  // create object to match structure of cleint messages
  const telegramMessage = {
    title: data.chat.title,
    text: data.text,
    name: `(telegram) ${data.from.first_name} ${data.from.last_name}`,
    userId: data.from.id,
    socketID: undefined,
    datetime: now,
  };

  // send the telegram message to all connected clients
  socketIO.emit("telegramMessage", telegramMessage);

  // if telegram message contains a $crypto symbol
  if (match) {
    // return the current price for the token query string
    const returnedData = await handleTokenQuery(match);

    // copy the data from telegram message and update attributes accordingly
    // TODO: Checky why this needs to be done in order for coingecko reponse to be rendered
    // if ites removed, user token query is just rendered twice
    const priceData = data;
    priceData.text = returnedData.msg;
    priceData.from.first_name = "Coingecko";
    priceData.from.last_name = "Price API";

    // Send the price message back to the telegram chat
    bot.sendMessage(chatId, returnedData.msg);

    // create object to match structure of cleint messages
    const telegramCoinGeckoMessage = {
      title: data.chat.title,
      text: data.text,
      name: "(telegram) Coingecko Price API",
      userId: undefined,
      socketID: undefined,
      datetime: now,
    };

    // Send telegramMessage object to all connected clients
    socketIO.emit("telegramMessage", telegramCoinGeckoMessage);
  }
}
