const { connectToDatabase } = require("../lib/mongodb");
const User = require("../models/User");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, postQuizScore } = req.body;

  if (!id || postQuizScore == null) {
    return res.status(400).json({ error: "id and postQuizScore are required" });
  }

  try {
    await connectToDatabase();

    const updated = await User.findByIdAndUpdate(
      id,
      { postQuizScore },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
