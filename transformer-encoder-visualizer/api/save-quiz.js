const { connectToDatabase } = require("../lib/mongodb");
const User = require("../models/User");

const VALID_TYPES = ["encoderPostScore", "decoderPreScore", "decoderPostScore"];

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, quizType, score } = req.body;

  if (!VALID_TYPES.includes(quizType) || score == null) {
    return res.status(400).json({ error: "Invalid quizType or missing score" });
  }

  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    await connectToDatabase();

    const update = { [quizType]: score };
    if (quizType === "encoderPostScore") update.postQuizScore = score;

    const updated = await User.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
