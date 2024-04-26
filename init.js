const express = require("express");
const cors = require("cors");

// create an express application instance
const app = express();

// create http instance using app
const http = require("http").Server(app);

// use cors middleware
app.use(cors());

module.exports = { app, http };
