const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require('./controllers/errorController');

const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use((req, res, next) => {
  console.log("Middleware");
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({ app: "demo", message: "Hello!" });
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use(globalErrorHandler)

module.exports = app;
