const mongoose = require("mongoose");

const twitchAccountSchema = new mongoose.Schema(
  {
    username: String,
    lastSeen: String,
    recording: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TwitchAccount", twitchAccountSchema);
