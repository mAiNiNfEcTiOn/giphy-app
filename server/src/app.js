const compression = require('compression');
const express = require("express");
const logger = require("morgan");
const path = require("path");

const searchHandler = require("./routes/search");

const app = express();

const clientSidePath = process.env.APP_PATH || path.join(__dirname, "public");

app.use((req, res, next) => {
  const allowedDomain = process.env.ALLOWED_DOMAIN;

  if (allowedDomain) {
    res.header("Access-Control-Allow-Origin", allowedDomain);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
  }
  next();
});

app.use(compression());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(clientSidePath));

app.use("/search", searchHandler);

app.use(function (err, req, res, next) {
  const isProduction = (process.env.NODE_ENV === 'production');
  console.error(err.stack);
  res.status(err.statusCode || 500).send(
    isProduction ? 'Something went wrong!!' : err.message
  );
});

module.exports = app;
