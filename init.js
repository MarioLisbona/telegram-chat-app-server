const express = require("express");
const cors = require("cors");
require("dotenv").config();

// create an express application instance
const app = express();

// create http instance using app
const http = require("http").Server(app);

// Determine the protocol based on environment
const protocol = process.env.NODE_ENV === "production" ? "https://" : "http://";

// connection variables for socket connection
let clientHost = process.env.CLIENT_HOST || "localhost";
let clientPort = process.env.CLIENT_PORT || 3000;

const socketIO = require("socket.io")(http, {
  cors: {
    origin: `${protocol}${clientHost}:${clientPort}`,
  },
});

// use cors middleware
app.use(cors());

module.exports = { app, http, socketIO };
