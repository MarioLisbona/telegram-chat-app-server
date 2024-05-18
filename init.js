import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

// Initialize Prisma client
const prisma = new PrismaClient();

// Create an Express application instance
const app = express();

// Use CORS middleware
app.use(cors());

// Create HTTP server
const httpServer = createServer(app);

// Determine the protocol based on environment
const protocol = process.env.NODE_ENV === "production" ? "https://" : "http://";

// connection variables for socket connection
let clientHost = process.env.CLIENT_HOST || "localhost";
let clientPort = process.env.CLIENT_PORT || 3000;

// Import and configure Socket.IO
const socketIO = new Server(httpServer, {
  cors: {
    origin: `${protocol}${clientHost}:${clientPort}`,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export { app, httpServer, socketIO, prisma };
