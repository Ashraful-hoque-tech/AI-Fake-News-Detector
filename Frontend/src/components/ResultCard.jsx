function ResultCard({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="result-card">

      <h2>Analysis Result</h2>

      <div className="verdict">
        <h3>Verdict</h3>

        <p>
          {result.verdict}
        </p>
      </div>

      <div className="confidence">
        <h3>Confidence</h3>

        <p>
          {result.confidence}%
        </p>
      </div>

      <div className="explanation">
        <h3>Explanation</h3>

        <p>
          {result.explanation}
        </p>
      </div>

      {result.redFlags && result.redFlags.length > 0 && (
        <div className="red-flags">

          <h3>Red Flags</h3>

          <ul>
            {result.redFlags.map((flag, index) => (
              <li key={index}>
                {flag}
              </li>
            ))}
          </ul>

        </div>
      )}

    </div>
  );
}

export default ResultCard;
