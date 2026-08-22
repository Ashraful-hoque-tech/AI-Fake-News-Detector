const Analysis = require("../models/Analysis");

const analyzeNewsWithAI = require("../services/llmService");


// ANALYZE NEWS
const analyzeNews = async (req, res) => {
  try {

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "News text is required.",
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        message: "News text is too long.",
      });
    }

    // Send news to LLM
    const aiResult = await analyzeNewsWithAI(
      text
    );

    // Save analysis to MongoDB
    const analysis = await Analysis.create({
      userId: req.user.id,

      inputText: text,

      verdict: aiResult.verdict,

      confidence: aiResult.confidence,

      explanation: aiResult.explanation,

      redFlags: aiResult.redFlags || [],
    });

    res.status(200).json({
      message: "News analyzed successfully.",

      analysis: {
        id: analysis._id,
        inputText: analysis.inputText,
        verdict: analysis.verdict,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        redFlags: analysis.redFlags,
        createdAt: analysis.createdAt,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        error.message ||
        "Failed to analyze news.",
    });
  }
};


// GET HISTORY
const getHistory = async (req, res) => {
  try {

    const history = await Analysis
      .find({
        userId: req.user.id,
      })
      .sort({
        createdAt: -1,
      });

    res.json({
      history,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch analysis history.",
    });
  }
};


module.exports = {
  analyzeNews,
  getHistory,
};