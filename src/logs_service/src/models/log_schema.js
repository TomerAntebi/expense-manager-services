/*
 C:
 Log schema (MongoDB collection: logs).
 Stores log entries written by all services (via logs_service).
*/
const { Schema, model } = require("mongoose");

// ++c Define schema for logs collection
const logSchema = new Schema(
  {
    level: String,
    request: String,
    message: String,
    time: Date,
    data: Object,
  },
  {
    versionKey: false,
    // ++c Remove MongoDB internal _id from API responses
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
    // ++c Remove MongoDB internal _id from API responses
    toObject: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);
logSchema.index({ level: 1 });
module.exports = model("Log", logSchema);
