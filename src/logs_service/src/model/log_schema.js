const { Schema, model } = require("mongoose");

const logSchema = new Schema(
  {
    level: String,
    request: String,
    message: String,
    time: Date,
    data: Object,
  },
  { versionKey: false }
);
logSchema.index({ level: 1 });
module.exports = model("Log", logSchema);
