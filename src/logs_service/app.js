const express = require("express");
const logsController = require("./src/controller/log_controller");

/*
 C:
 Express app factory for Logs service.
 Exported for unit testing (Supertest) without opening a real network port.
*/

const app = express();
app.use(express.json());
app.use("/", logsController);

module.exports = app;

