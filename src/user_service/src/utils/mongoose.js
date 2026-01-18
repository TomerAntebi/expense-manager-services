/*
 C:
 MongoDB connection helper (Mongoose).
 Requirement: use MongoDB Atlas and Mongoose. Each process connects independently.
*/
const mongoose = require("mongoose");

// ++c Connect to MongoDB Atlas using a URI from .env
const connectToDB = (MONGO_URI) => {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("[App] Connected to MongoDB"))
    .catch((error) => {
      console.error("[App] MongoDB connection error:", error.message);
    });
};

module.exports = connectToDB;
