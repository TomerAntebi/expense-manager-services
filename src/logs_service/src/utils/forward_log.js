/*
 C:
 Internal log persistence helper for Logs service.
 Stores logs directly in MongoDB (collection: logs).
*/

const logService = require("../models/log_service");

const forwardLog = async (logData) => {
  try {
    // ++c Best-effort logging; must never crash the process
    await logService.addLog(logData);
  } catch (err) {
    // ++c Swallow logging failures to avoid unhandled promise rejections
    console.error("Failed to store log", err.message);
  }
};

module.exports = forwardLog;

