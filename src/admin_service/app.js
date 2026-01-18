const express = require("express");
const adminController = require("./src/controller/admin_controller");

/*
 C:
 Express app factory for Admin/About service.
 Exported for unit testing (Supertest) without opening a real network port.
*/

const app = express();
app.use(express.json());
app.use("/", adminController);

module.exports = app;

