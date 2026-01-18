/*
 C:
 Request logging middleware for the Logs service itself.
 Requirement: write a log entry for every HTTP request + endpoint access.
*/
const sendLogToDB = require("../utils/add_log_to_db");

const requestLogger = (req, res, next) => {
  // ++c Track request duration
  const startTime = Date.now();

  res.on("finish", () => {
    // ++c Log only successful responses here; errors are logged by error handler
    if (res.statusCode < 400) {
      const logData={
        request: `${req.method} ${req.originalUrl}`,
        statusCode: res.statusCode,
        durationMs: Date.now() - startTime,
      };
      sendLogToDB(logData);
    }
  });

  next();
};

module.exports = requestLogger;
