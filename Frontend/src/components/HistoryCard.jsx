function HistoryCard({ item }) {
  return (
    <div className="history-card">

      <p className="history-text">
        {item.inputText}
      </p>

      <div className="history-result">

        <strong>
          {item.verdict}
        </strong>

        <span>
          Confidence: {item.confidence}%
        </span>

      </div>

      <small>
        {new Date(item.createdAt).toLocaleString()}
      </small>

    </div>
  );
}

export default HistoryCard;