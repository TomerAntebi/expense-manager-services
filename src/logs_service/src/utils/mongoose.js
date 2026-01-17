const mongoose = require("mongoose");

const connectToDB = (MONGO_URI) => {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("[App] Connected to MongoDB"))
    .catch((error) => {
      console.error("[App] MongoDB connection error:", error.message);
    });
};

module.exports = connectToDB;
