const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const globalErrorHandler = require("./controllers/errorController");
const path = require("path");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");

const app = express();

const corsOrigin =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_CORS_ORIGIN || "http://localhost:3001"
    : process.env.PROD_CORS_ORIGIN || "http://localhost:8001";

app.use("/", express.static("uploads"));
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" }));

// app.use(
//   mongoSanitize({
//     replaceWith: "_",
//   })
// );

// Routes for users
app.use(`${process.env.API_ROUTE}/users`, userRouter);

// Routes for posts
app.use(`${process.env.API_ROUTE}/posts`, postRouter);

// 404 handler - must be defined AFTER all other routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
