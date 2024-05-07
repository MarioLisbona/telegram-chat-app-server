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
