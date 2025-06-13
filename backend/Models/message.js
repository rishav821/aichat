const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content:    { type: String },
  sender:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channel:    { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  attachments:[{ type: mongoose.Schema.Types.ObjectId, ref: "FileAttachment" }],
  status: {type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent'},
  isAI: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);