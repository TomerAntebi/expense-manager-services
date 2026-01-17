const mongoose = require("mongoose");

const connectToDB = (MONGO_URI) => {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("[Admin Service] Connected to MongoDB"))
    .catch((error) => {
      console.error("[Admin Service] MongoDB connection error:", error.message);
    });
};

module.exports = connectToDB;
