/*
 C:
 Central error handling middleware for this service.
 Requirement: error replies must include at least {id, message}.
 In addition, we forward error logs to the Logs service.
*/
const forwardLog = require("../utils/forward_log");

// ++c 404 handler for unknown routes
exports.notFoundHandler = (req, res, next) => {
  const err = new Error(`Route: ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
};

// ++c Global error handler (single place that formats error responses)
exports.errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  // ++c Send log to Logs service (separate process)
  const logData={
    request: `${req.method} ${req.originalUrl}`,
    statusCode: status,
    durationMs: 0,
    error: err.message,
  };
  forwardLog(logData);

  // ++c Error response format required by project
  res.status(status).json({
    id: status,
    message: err.message || "Internal Server Error",
  });
};
