export const errorHandler = (err, req, res, next) => {
  console.error("An error occurred:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

const allowedOrigins = [
  "https://telegram-chat-app.netlify.app/",
  "http://localhost:5173",
];
export const corsHandler = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};
