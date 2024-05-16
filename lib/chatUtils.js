import moment from "moment";
import { prisma } from "../init.js";

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
    throw new Error(`Unable to fetch messages: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}
