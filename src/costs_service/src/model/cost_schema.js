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

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

costSchema.index({ userid: 1, createdAt: 1 });

/* ++c Export the Mongoose model */
module.exports = model("Cost", costSchema, "costs");
