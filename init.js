const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);

app.use(cors());

module.exports = { app, http };
