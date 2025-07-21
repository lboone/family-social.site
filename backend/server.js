const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Exit the process to avoid running in an unstable state
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

let dbConnectionString = process.env.DB;
if (process.env.NODE_ENV == "development") {
  dbConnectionString = process.env.DEV_DB;
}

mongoose
  .connect(dbConnectionString)
  .then(({ connection }) => {
    if (connection && connection.db && connection.db.databaseName) {
      console.log(`Connected to Database at ${connection.db.databaseName}`);
    } else {
      console.log("Connected to Database, but database name is not available");
    }
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
