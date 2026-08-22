const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inputText: {
      type: String,
      required: true,
    },

    verdict: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    explanation: {
      type: String,
      required: true,
    },

    redFlags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);