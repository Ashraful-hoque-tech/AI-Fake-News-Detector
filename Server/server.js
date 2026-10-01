const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");

dotenv.config();

const app = express();


// Connect MongoDB
connectDB();


// Middleware
// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-fake-news-detector-blue.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Fake News Detector API is running.",
  });
});


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});