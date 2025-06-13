const { generateAIResponse } = require('../Config/openai');

const chatWithAI = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const aiReply = await generateAIResponse(prompt);
    res.status(200).json({ message: aiReply });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
};

module.exports = { chatWithAI };
