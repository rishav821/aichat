const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Channel", channelSchema);