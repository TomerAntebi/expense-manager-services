const express = require("express");
const costsController = require("./src/controller/cost_controller");

/*
 C:
 Express app factory for Costs service.
 Exported for unit testing (Supertest) without opening a real network port.
*/

const app = express();
app.use(express.json());
app.use("/", costsController);

module.exports = app;

