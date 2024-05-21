export const errorHandler = (err, req, res, next) => {
  console.error("An error occurred:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export const corsHandler = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Change * to the specific origin if needed
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};
