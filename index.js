const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

// DOTENV CONFIG
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// BODY AND COOKIE PARSER
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));

// CORS 
app.use(cors({ origin: '*' }));

// ROUTES
app.get("/", (req, res) => {
  res.send("BACKEND TIKET.IN");
});

// ERROR HANDLING
app.use((req, res, next) => {
  const error = new Error("Not found!");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// SERVER START
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

module.exports = app;