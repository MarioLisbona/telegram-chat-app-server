import { handleTokenQuery } from "./tokenPrice.js";
import { prisma } from "../init.js";
import moment from "moment";

function convertToISO8601(dateString) {
  // Define the format of the input string
  var dateFormat = "MMM DD, YYYY hh:mm A";
  // Parse the input string using moment.js library
  var dtObject = moment(dateString, dateFormat);

  // Check if the date is valid
  if (dtObject.isValid()) {
    // Convert the moment object to ISO-8601 format
    var iso8601Date = dtObject.toISOString();
    return iso8601Date;
  } else {
    // Handle invalid date string
    return "Invalid date format";
  }
}

// Event handler callback for "message"
export async function handleMessage(socketIO, bot, chatId, data) {
  // Receives the message from the chat client
  // Sends the messages to all connected chat clients
  socketIO.emit("messageResponse", data);

  console.log("Received message messageResponse---->", data);
  // add sentFrom information to data object
  data.sentFrom = "chat client";
  data.datetime = convertToISO8601(data.datetime);

  try {
    const savedMessage = await prisma.message.create({
      data: {
        text: data.text,
        name: data.name,
        userId: data.userId,
        socketID: data.socketID,
        datetime: data.datetime,
        sentFrom: data.sentFrom,
      },
    });
    console.log("Message saved in DB", savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }

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

    // // Send the price message back to the telegram chat
    bot.sendMessage(chatId, returnedData.msg);

    // datetime for now
    const now = new Date();

    // create object to match structure of cleint messages
    const clientCoinGeckoMessage = {
      text: returnedData.msg,
      name: "(telegram) Coingecko Price API",
      userId: "undefined",
      socketID: "undefined",
      datetime: now,
    };

    // Send priceData object to all connected clients
    socketIO.emit("messageResponse", clientCoinGeckoMessage);
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
    text: data.text,
    name: `(telegram) ${data.from.first_name} ${data.from.last_name}`,
    userId: data.from.id,
    socketID: "undefined",
    datetime: now,
  };

  // send the telegram message to all connected clients
  socketIO.emit("telegramMessage", telegramMessage);

  // if telegram message contains a $crypto symbol
  if (match) {
    // return the current price for the token query string
    const returnedData = await handleTokenQuery(match);

    // Send the price message back to the telegram chat
    bot.sendMessage(chatId, returnedData.msg);

    // create object to match structure of cleint messages
    const telegramCoinGeckoMessage = {
      text: returnedData.msg,
      name: "(telegram) Coingecko Price API",
      userId: "undefined",
      socketID: "undefined",
      datetime: now,
    };

    // Send telegramMessage object to all connected clients
    socketIO.emit("telegramMessage", telegramCoinGeckoMessage);
  }
}
