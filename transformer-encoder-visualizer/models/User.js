const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  preQuizScore: { type: Number, default: null },
  postQuizScore: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
