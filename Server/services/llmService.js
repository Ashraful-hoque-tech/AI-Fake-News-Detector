const axios = require("axios");

const createNewsPrompt = require("../utils/prompt");

const analyzeNewsWithAI = async (newsText) => {
  const prompt = createNewsPrompt(newsText);

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response received from Gemini.");
    }

    // Remove markdown fences if Gemini adds them
    const cleanedText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedText);

    return result;

  } catch (error) {
    console.error(error);
    
    console.error(
      "Gemini API error:",
  
      error.response?.data || error.message
    );

    throw new Error(
      console.error(Error),
      
      "Failed to analyze news using AI."
    );
  }
};

module.exports = analyzeNewsWithAI;