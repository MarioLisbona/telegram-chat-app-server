import moment from "moment";
import { prisma } from "../init.js";
import { handleTokenQuery } from "./tokenPrice.js";

export function convertToISO8601(dateString) {
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

export async function saveMessageToDb(data) {
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
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function getAllMessages() {
  try {
    const messages = await prisma.message.findMany();
    return messages;
  } catch (error) {
    throw new Error(`Unable to fetch messages: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function handleMatchCryptoToken(
  match,
  bot,
  socketIO,
  chatId,
  clientMsg = false
) {
  // return the current price for the token query string
  const returnedData = await handleTokenQuery(match);

  // Send the price message back to the telegram chat
  bot.sendMessage(chatId, returnedData.msg);

  // datetime for now
  const now = new Date();

  // create object to match structure of cleint messages
  const coinGeckoPriceMessage = {
    text: returnedData.msg,
    name: "(telegram) Coingecko Price API",
    userId: "undefined",
    socketID: "undefined",
    datetime: now,
  };

  // add sentFrom information to data object
  coinGeckoPriceMessage.sentFrom = "Coingecko Price API";

  // datetime created on client uses the moment library format
  // format datetime back to ISO8601

  if (clientMsg) {
    coinGeckoPriceMessage.datetime = convertToISO8601(
      coinGeckoPriceMessage.datetime
    );
  }

  // write the message to PSQL
  saveMessageToDb(coinGeckoPriceMessage);

  // Send telegramMessage object to all connected clients
  socketIO.emit("telegramMessage", coinGeckoPriceMessage);
}
