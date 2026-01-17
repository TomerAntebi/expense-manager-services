const sendLogToDB = require("../utils/add_log_to_db");

exports.notFoundHandler = (req, res, next) => {
  const err = new Error(`Route: ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
};

exports.errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const logData={
    request: `${req.method} ${req.originalUrl}`,
    statusCode: status,
    durationMs: 0,
    error: err.message,
  };
  sendLogToDB(logData);

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
};
