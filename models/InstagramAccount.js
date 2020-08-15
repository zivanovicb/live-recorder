const mongoose = require("mongoose");

const instagramAccountSchema = new mongoose.Schema(
  {
    username: String,
    lastSeen: String,
    recording: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstagramAccount", instagramAccountSchema);
