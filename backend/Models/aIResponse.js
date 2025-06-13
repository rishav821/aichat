const mongoose = require("mongoose");

const aiResponseSchema = new mongoose.Schema({
  originalMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  response:        { type: String },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model("AIResponse", aiResponseSchema);
