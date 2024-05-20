export const errorHandler = (err, req, res, next) => {
  console.error("An error occurred:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
