import { useEffect, useState } from "react";

import api from "../services/api";
import HistoryCard from "../components/HistoryCard";

function History() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchHistory = async () => {

      try {

        const response = await api.get(
          "/news/history"
        );

        setHistory(response.data.history);

      } catch (error) {

        console.error(error);

        setError(
          error.response?.data?.message ||
          "Unable to load history."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

  }, []);

  if (loading) {
    return <p>Loading history...</p>;
  }

  return (
    <div className="history-page">

      <h1>
        Analysis History
      </h1>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {history.length === 0 ? (

        <p>
          No analysis history found.
        </p>

      ) : (

        <div className="history-list">

          {history.map((item) => (
            <HistoryCard
              key={item._id}
              item={item}
            />
          ))}

        </div>

      )}

    </div>
  );
}

export default History;