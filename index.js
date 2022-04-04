const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mainRouter = require("./routes/mainRouter");

dotenv.config();

const PORT = process.env.PORT ?? 80;
const URL = process.env.URL ?? "http://127.0.0.1";
const NODE_ENV = process.env.NODE_ENV ?? "development";
const app = express();

const allowCorsList = require("./config/cors.json")[NODE_ENV].allowList;

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;

  if (
    allowCorsList.includes("*") ||
    allowCorsList.indexOf(req.header("Origin")) !== -1
  ) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(bodyParser.json());
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`Server started at ${URL}:${PORT}`);
});
