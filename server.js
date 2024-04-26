const { app, http } = require("./init");
const { createSocketServer } = require("./socketServer");
const PORT = 4000;

createSocketServer();

app.get("/", (req, res) => {
  res.json({ message: "Hello from the Home Page" });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
