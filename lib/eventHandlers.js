// Event handler callback for "newUser"
export function handleNewUser(socketIO, users, data) {
  //Adds the new user to the list of users
  users.push(data);
  console.log(users);
  //Sends the list of users to the client
  socketIO.emit("newUserResponse", users);
}
