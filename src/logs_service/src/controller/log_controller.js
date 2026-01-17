// src/routes/userRoutes.js
const { Router } = require("express");
const removeMongoId = require("../middleware/app_middle_ware");
const {
  notFoundHandler,
  errorHandler,
} = require("../middleware/error_handlers.js");
const logService = require("../model/log_service");

const logController = Router(); // Create a new logController object
logController.use(removeMongoId);

logController.get("/api/logs", async (req, res) => {
  const logs = await logService.getAllLogs();
  res.json(logs);
});

logController.post("/api/add", async (req, res) => {
  await logService.addLog(req.body);

  res.status(201).json({ ok: true });
});

logsController.use(notFoundHandler);
logsController.use(errorHandler);

module.exports = logController;
