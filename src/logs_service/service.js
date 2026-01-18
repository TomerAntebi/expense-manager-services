require("dotenv").config({ quiet: true });
const express = require("express");
const logsController = require("./src/controller/log_controller");
const connectToDB = require("./src/utils/mongoose");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

connectToDB(process.env.MONGO_URI);

// 2. Mount the router

app.use("/", logsController);

app.get("/", (req, res) => {
  res.send("<h1>Log Service!<h1>");
});

app.listen(port, () => {
  console.log(`Log Service listening on port ${port}`);
});
