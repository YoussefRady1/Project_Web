const { connectToDatabase } = require("../lib/mongodb");
const User = require("../models/User");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, preQuizScore } = req.body;

  if (!name || preQuizScore == null) {
    return res.status(400).json({ error: "name and preQuizScore are required" });
  }

  try {
    await connectToDatabase();

    const user = await User.create({
      name,
      preQuizScore,
    });

    return res.status(200).json({ id: user._id.toString() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
