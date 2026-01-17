const { Schema,model } = require("mongoose");

const userSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "id must be an integer",
      },
    },

    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    birthday: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

userSchema.index({ id: 1 });

/* ++c Create model */
module.exports = model("User", userSchema, "users");
