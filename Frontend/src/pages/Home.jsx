import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NewsInput from "../components/NewsInput";
import ResultCard from "../components/ResultCard";
import Loading from "../components/Loading";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeNews = async (newsText) => {

    if (!user) {
      navigate("/login");
      return;
    }

    try {

      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post("/news/analyze", {
        text: newsText,
      });

      setResult(response.data.analysis);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Something went wrong while analyzing the news."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">

      <section className="hero">

        <h1>
          Detect Fake News with AI
        </h1>

        <p>
          Analyze news articles and identify potentially
          misleading or false information using AI.
        </p>

      </section>

      <section className="analyzer">

        <NewsInput
          onAnalyze={analyzeNews}
          loading={loading}
        />

        {loading && <Loading />}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <ResultCard result={result} />

      </section>

    </div>
  );
}

export default Home;