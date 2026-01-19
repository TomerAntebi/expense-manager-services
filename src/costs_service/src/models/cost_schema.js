const { Schema,model } = require("mongoose");

/*
 C:
 Cost model (MongoDB collection: costs).
 Stores individual cost items for users.
*/

/* ++c Define schema for costs collection */
const ALLOWED_CATEGORIES = ["food", "health", "housing", "sports", "education"];

const costSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
    },

    userid: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "userid must be an integer",
      },
    },

    sum: {
      type: Number,
      required: true,
      min: 1,
    },

    // ++c Cost date/time (if not provided, server uses request time)
    date: {
      type: Date,
      default: Date.now,
    },
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

// ++c Optimize monthly queries and reports
costSchema.index({ userid: 1, date: 1 });

/* ++c Export the Mongoose model */
module.exports = model("Cost", costSchema, "costs");
