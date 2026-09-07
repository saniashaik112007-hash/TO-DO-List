const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

userSchema.index({ rollNo: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
