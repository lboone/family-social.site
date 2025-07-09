const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Exit the process to avoid running in an unstable state
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
const PORT =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_PORT || 3000
    : process.env.PROD_PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1); // Exit the process to avoid running in an unstable state
  });
});
