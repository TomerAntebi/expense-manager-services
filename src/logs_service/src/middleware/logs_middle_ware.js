const sendLogToDB = require("../utils/add_log_to_db");

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
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
