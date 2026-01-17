const logModel = require("./log_schema");

exports.addLog = async (logData) => {
  const { request, message, statusCode, durationMs, error } = logData;
  const level = statusCode >= 400 ? "error" : "info";

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
  return await logModel.find({});
};

exports.getAllLogsByLevel = async (level) => {
  return await logModel.find({ level: level });
};
