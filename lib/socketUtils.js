export const getChatId = async (prisma) => {
  try {
    let chatId;
    // find the first chat object
    const chatData = await prisma.chat.findFirst();

    // if chatData contains an object
    if (chatData) {
      // assign chat ID to variable
      chatId = chatData.chatId;
      console.log("retrieving chatId", chatId);

      return chatId;
    }
  } catch (error) {
    console.error("Error retrieving chat ID:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const setChatId = async (data, prisma) => {
  try {
    // create variables for chat info
    let chatId = data.chat.id;
    let chatTitle = data.chat.title;
    // retrieve the array of chat objects
    const chat = await prisma.chat.findFirst();

    // if the chats array is empty assign the chat Id
    // This will only create a single record for this chat
    if (!chat) {
      const returnedChatData = await prisma.chat.create({
        data: {
          chatId: chatId,
          title: chatTitle,
        },
      });
      console.log("setting chat ID to DB", returnedChatData.chatId);
    }
  } catch (error) {
    console.error("Error setting the chat ID:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export async function setChatIdOnServer(bot, prisma) {
  // bot event handler to receive "message" from telegram app
  // setChatId will store the chat id if it hasn't been set already

  bot.on("message", async (data) => {
    // save the chatId to the db
    setChatId(data, prisma);
  });
}
