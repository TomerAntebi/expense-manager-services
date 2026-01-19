/*
 C:
 Utility used by middleware/error handlers to forward logs to Logs service.
 Requirement: logs should be saved to MongoDB (handled by logs_service).
*/

const forwardLog = async (logData) => {
  try {
    // ++c Forward to Logs service endpoint (POST)
    await fetch(process.env.LOG_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    // ++c Do not crash the service if logging fails
    console.error("Failed to send log", err.message);
  }
};

module.exports = forwardLog;

