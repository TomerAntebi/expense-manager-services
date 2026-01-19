/*
 C:
 Request logging middleware.
 Requirement: write a log entry for every HTTP request + endpoint access.
 We forward logs to the Logs service (separate process).
*/
const forwardLog = require("../utils/forward_log");

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
      forwardLog(logData);
    }
  });

  next();
};

module.exports = requestLogger;
