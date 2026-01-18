/*
 C:
 Logs service controller (routes).
 Responsible for:
 - GET /api/logs (list logs)
 - POST /api/add (accept logs from other services)
*/
const { Router } = require("express");
const requestLogger = require("../middleware/logs_middle_ware");
const {
  notFoundHandler,
  errorHandler,
} = require("../middleware/error_handlers.js");
const logService = require("../models/log_service");

// ++c Create router and apply request logging
const logController = Router();
logController.use(requestLogger);

// ++c List of logs
logController.get("/api/logs", async (req, res, next) => {
  try {
    const logs = await logService.getAllLogs();
    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
});

// ++c Add a log entry (used by other services)
logController.post("/api/add", async (req, res, next) => {
  try {
    await logService.addLog(req.body);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ++c Error handlers
logController.use(notFoundHandler);
logController.use(errorHandler);

module.exports = logController;
