const express = require("express");
const userController = require("./src/controller/user_controller");

/*
 C:
 Express app factory for Users service.
 Exported for unit testing (Supertest) without opening a real network port.
*/

const app = express();
app.use(express.json());
app.use("/", userController);

module.exports = app;

