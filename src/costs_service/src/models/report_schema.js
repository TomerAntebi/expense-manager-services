const { Schema,model } = require("mongoose");

/*
 C:
 Cost model (MongoDB collection: costs).
 Stores individual cost items for users.
*/

/* ++c Define schema for costs collection */

const reportSchema = new Schema(
  {
    userid: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    costs: { type: Array, required: true },
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

/* ++c Unique report per (userid, year, month) */
reportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

/* ++c Export the Mongoose model */
module.exports = model("Report", reportSchema, "reports");
