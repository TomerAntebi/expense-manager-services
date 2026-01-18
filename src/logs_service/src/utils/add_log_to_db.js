const logService = require("../models/log_service");

/*
 C:
 Logs service stores logs directly in MongoDB (collection: logs).
 Other services send logs to this service, but the Logs service itself also
 writes logs for every incoming HTTP request and on errors.
*/

const sendLogToDB = async (logData) => {
  try {
    // ++c Best-effort logging; must never crash the process
    await logService.addLog(logData);
  } catch (err) {
    // ++c Swallow logging failures to avoid unhandled promise rejections
    console.error("Failed to store log", err.message);
  }
};

module.exports = sendLogToDB;

