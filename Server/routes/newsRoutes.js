const express = require("express");

const {
  analyzeNews,
  getHistory,
} = require("../controllers/newsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/analyze",
  protect,
  analyzeNews
);

router.get(
  "/history",
  protect,
  getHistory
);

module.exports = router;