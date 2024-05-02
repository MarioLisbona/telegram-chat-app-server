async function getChatId(prisma) {
  let chatId;
  // find the first chat object
  const chatData = await prisma.chat.findFirst();

  // if chatData contains an object
  if (chatData) {
    // assign chat ID to variable
    chatId = chatData.chatId;
    return chatId;
  }
}

async function setChatId(data, prisma) {
  // create variables for chat info
  let chatId = data.chat.id;
  let chatTitle = data.chat.title;
  // retrieve the array of chat objects
  const chats = await prisma.chat.findMany();

  // if the chats array is empty assign the chat Id
  // This will only create a single record for this chat
  if (chats.length == 0) {
    const chat = await prisma.chat.create({
      data: {
        chatId: chatId,
        title: chatTitle,
      },
    });

    console.log("setting chat ID to DB ");
  }
}

export { getChatId, setChatId };
