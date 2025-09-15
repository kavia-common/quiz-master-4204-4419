import { useEffect, useState } from "react";
import { fetchQuizzes, startAttempt } from "../api";

// PUBLIC_INTERFACE
export default function QuizList({ onStart, defaultUserName = "" }) {
  /** List available quizzes and allow user to start one by providing their name. */
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [userName, setUserName] = useState(defaultUserName);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchQuizzes();
        if (isMounted) setQuizzes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) setErr(e.message || "Failed to load quizzes");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStart = async (quiz) => {
    if (!userName.trim()) {
      setErr("Please enter your name to start the quiz.");
      return;
    }
    setErr("");
    setStartingId(quiz.id);
    try {
      const { attempt_id } = await startAttempt({ user_name: userName.trim(), quiz_id: quiz.id });
      onStart({
        attemptId: attempt_id,
        quizId: quiz.id,
        quizTitle: quiz.title || `Quiz #${quiz.id}`,
        userName: userName.trim(),
      });
    } catch (e) {
      setErr(e.message || "Unable to start attempt");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading quizzes…</div>;
  if (err) {
    // Still show list if available
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Available Quizzes</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Enter your name and choose a quiz to begin.
      </p>

      <div style={{ margin: "16px 0", display: "flex", gap: 8 }}>
        <input
          aria-label="Your name"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-color)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {err && (
        <div
          role="alert"
          style={{
            background: "#ffd6d6",
            color: "#7a0000",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {err}
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {quizzes.map((qz) => (
          <div
            key={qz.id}
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 16,
              background: "var(--bg-secondary)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{qz.title || `Quiz #${qz.id}`}</div>
                {qz.description && (
                  <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{qz.description}</div>
                )}
              </div>
              <button
                className="theme-toggle"
                style={{ position: "static", padding: "8px 14px" }}
                onClick={() => handleStart(qz)}
                disabled={startingId === qz.id}
              >
                {startingId === qz.id ? "Starting…" : "Start"}
              </button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div style={{ color: "var(--text-secondary)" }}>No quizzes found.</div>
        )}
      </div>
    </div>
  );
}
