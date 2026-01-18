/*
 C:
 Logs service business logic.
 Stores and retrieves log documents from MongoDB.
*/
const logModel = require("./log_schema");

exports.addLog = async (logData) => {
  // ++c Normalize input and derive log level from status code
  const { request, message, statusCode, durationMs, error } = logData;
  const level = statusCode >= 400 ? "error" : "info";

  // ++c Persist log to MongoDB (collection: logs)
  await logModel.create({
    level: level,
    request: request,
    message: message,
    time: new Date(),
    data: {
      statusCode,
      durationMs,
      error,
    },
  });
};

exports.getAllLogs = async () => {
  // ++c Return all logs documents
  return await logModel.find({});
};

