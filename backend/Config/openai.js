const fetch = require("node-fetch");
require("dotenv").config();

async function generateAIResponse(prompt) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
        "X-Title": "AI Chat App"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-30b-a3b:free",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      console.error("OpenRouter response format unexpected:", data);
      return "Sorry, I couldn’t think of a response.";
    }

  } catch (err) {
    console.error("OpenRouter fetch error:", err);
    return "Sorry, something went wrong while contacting the AI.";
  }
}

module.exports = {
  generateAIResponse,
};
