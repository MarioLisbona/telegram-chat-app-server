import moment from "moment";
import { prisma } from "../init.js";
import { handleTokenQuery } from "./tokenPrice.js";

export const convertToISO8601 = (dateString) => {
  try {
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
  } catch (error) {
    console.error("Error converting date:", error);
    throw error;
  }
};

export const saveMessageToDb = async (data) => {
  try {
    const savedMessage = await prisma.message.create({
      data: {
        text: data.text,
        name: data.name,
        userId: data.userId,
        socketID: data.socketID,
        createdAt: data.createdAt,
        sentFrom: data.sentFrom,
      },
    });
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

export const getAllMessages = async () => {
  try {
    const messages = await prisma.message.findMany();
    return messages;
  } catch (error) {
    throw new Error(`Unable to fetch messages: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const getChatData = async () => {
  try {
    // find the first chat object
    const chatData = await prisma.chat.findFirst();
    return chatData;
  } catch (error) {
    throw new Error(`Unable to fetch chat data: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const handleMatchCryptoToken = async (
  match,
  bot,
  socketIO,
  chatId,
  clientMsg = false
) => {
  try {
    // return the current price for the token query string
    const returnedData = await handleTokenQuery(match);

    // Send the price message back to the telegram chat
    bot.sendMessage(chatId, returnedData.msg);

    // datetime for now
    const now = new Date();

    // create object to match structure of client messages
    const coinGeckoPriceMessage = {
      text: returnedData.msg,
      name: "(telegram) Coingecko Price API",
      userId: "undefined",
      socketID: "undefined",
      createdAt: now,
    };

    // add sentFrom information to data object
    coinGeckoPriceMessage.sentFrom = "Coingecko Price API";

    // createdAt on client uses the moment library format
    // format createdAt back to ISO8601
    if (clientMsg) {
      coinGeckoPriceMessage.createdAt = convertToISO8601(
        coinGeckoPriceMessage.createdAt
      );
    }

    // write the message to PSQL
    await saveMessageToDb(coinGeckoPriceMessage);

    // Send telegramMessage object to all connected clients
    socketIO.emit("telegramMessage", coinGeckoPriceMessage);
  } catch (error) {
    console.error("Error in handleMatchCryptoToken:", error);
    // Optionally, you can also send an error message back to the client or bot
    bot.sendMessage(chatId, "Error handling crypto token match.");
  }
};
