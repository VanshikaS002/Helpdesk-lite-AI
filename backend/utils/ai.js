const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const categories = ["Technical", "Billing", "Account", "General"];

async function categorizeTicket(title, description) {
  const prompt = `Classify the following ticket into one of these categories: ${categories.join(", ")}.\n\nTitle: ${title}\nDescription: ${description}\n\nCategory:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0.2,
    });

    const category = response.choices[0].message.content.trim();

    if (categories.includes(category)) {
      return category;
    } else {
      return "General"; // fallback
    }
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    return "General"; // fallback
  }
}

module.exports = { categorizeTicket };