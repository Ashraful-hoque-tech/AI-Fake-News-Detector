import { useState } from "react";

function NewsInput({ onAnalyze, loading }) {
  const [newsText, setNewsText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newsText.trim()) {
      return;
    }

    onAnalyze(newsText);

    // setNewsText("");
  };

  return (
    <form onSubmit={handleSubmit} className="news-form">

      <textarea
        placeholder="Paste a news article or headline here..."
        value={newsText}
        onChange={(e) => setNewsText(e.target.value)}
        rows="10"
      />

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze News"}
      </button>

    </form>
  );
}

export default NewsInput;
