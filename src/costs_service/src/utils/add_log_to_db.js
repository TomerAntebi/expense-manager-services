const sendLogToDB = async (logData) => {
  try {
    await fetch(process.env.LOG_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error("Failed to send log", err.message);
  }
};

module.exports = sendLogToDB;
