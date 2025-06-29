const { genSalt, hash } = require("bcrypt");
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
  profilePic: { type: String, default: "" },
  color: {type: Number, required:false},
  profileSetup: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  const salt = await genSalt();
  this.password = await hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);

