import React, { useEffect, useState } from "react";
import "./App.css";
import QuizList from "./components/QuizList";
import QuizRunner from "./components/QuizRunner";
import Leaderboard from "./components/Leaderboard";

// Minimal view-state routes
const VIEWS = {
  LIST: "list",
  RUN: "run",
  RESULT: "result",
  LEADERBOARD: "leaderboard",
};

// PUBLIC_INTERFACE
function App() {
  /** Main app with minimal view-state routing for quizzes. */
  const [theme, setTheme] = useState("light");
  const [view, setView] = useState(VIEWS.LIST);
  const [runCtx, setRunCtx] = useState(null); // { attemptId, quizId, quizTitle, userName }
  const [result, setResult] = useState(null); // { attempt_id, score, total_questions, quizId, quizTitle, userName, time_taken_seconds }

  // apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleStart = ({ attemptId, quizId, quizTitle, userName }) => {
    setRunCtx({ attemptId, quizId, quizTitle, userName });
    setView(VIEWS.RUN);
  };

  const handleSubmitted = (res) => {
    setResult(res);
    setView(VIEWS.RESULT);
  };

  const resetToList = () => {
    setRunCtx(null);
    setResult(null);
    setView(VIEWS.LIST);
  };

  const header = (
    <div className="App-header" style={{ minHeight: "auto", padding: 16 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1 style={{ margin: 0, padding: "12px 0" }}>Quiz Master</h1>
      </div>
    </div>
  );

  return (
    <div className="App">
      {header}

      {view === VIEWS.LIST && (
        <div>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 12px" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="theme-toggle"
                style={{ position: "static", padding: "8px 14px" }}
                onClick={() => setView(VIEWS.LEADERBOARD)}
              >
                View Leaderboard
              </button>
            </div>
          </div>
          <QuizList onStart={handleStart} />
        </div>
      )}

      {view === VIEWS.RUN && runCtx && (
        <QuizRunner
          quizId={runCtx.quizId}
          quizTitle={runCtx.quizTitle}
          attemptId={runCtx.attemptId}
          userName={runCtx.userName}
          onExit={resetToList}
          onSubmitted={handleSubmitted}
        />
      )}

      {view === VIEWS.RESULT && result && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Result</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="theme-toggle"
                style={{ position: "static", padding: "8px 14px" }}
                onClick={() => setView(VIEWS.LEADERBOARD)}
              >
                Leaderboard
              </button>
              <button
                className="theme-toggle"
                style={{ position: "static", padding: "8px 14px" }}
                onClick={resetToList}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 16, background: "var(--bg-secondary)", textAlign: "left" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {result.quizTitle || `Quiz #${result.quizId}`}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Player:</strong> {result.userName}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Score:</strong> {result.score} / {result.total_questions}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Time:</strong> {result.time_taken_seconds ?? "-"} seconds
            </div>
          </div>
        </div>
      )}

      {view === VIEWS.LEADERBOARD && (
        <Leaderboard limit={20} onBack={resetToList} />
      )}
    </div>
  );
}

export default App;
