
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename:   { type: String, required: true },
  url:        { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message:    { type: mongoose.Schema.Types.ObjectId, ref: "Message" }
}, { timestamps: true });

module.exports = mongoose.model("FileAttachment", fileSchema);
