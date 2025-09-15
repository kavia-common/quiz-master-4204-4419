import { useEffect, useMemo, useState } from "react";
import { answerQuestion, fetchQuestions, submitAttempt } from "../api";

// PUBLIC_INTERFACE
export default function QuizRunner({ quizId, quizTitle, attemptId, userName, onExit, onSubmitted }) {
  /** Run through questions, record answers, and submit. */
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selected_option
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchQuestions(quizId);
        if (!Array.isArray(data.questions)) throw new Error("Invalid questions response");
        if (isMounted) {
          setQuestions(data.questions);
          setIdx(0);
        }
      } catch (e) {
        if (isMounted) setErr(e.message || "Failed to load questions");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [quizId]);

  const current = questions[idx] || null;
  const total = questions.length;

  const options = useMemo(() => {
    if (!current) return [];
    return [
      { key: "A", text: current.option_a },
      { key: "B", text: current.option_b },
      { key: "C", text: current.option_c },
      { key: "D", text: current.option_d },
    ];
  }, [current]);

  const selectOption = async (letter) => {
    if (!current) return;
    setErr("");
    const qid = current.id;
    // Optimistic UI update
    setAnswers((prev) => ({ ...prev, [qid]: letter }));
    try {
      await answerQuestion(attemptId, {
        question_id: qid,
        selected_option: letter,
      });
    } catch (e) {
      setErr(e.message || "Failed to record answer");
      // revert? keep optimistic but show error
    }
  };

  const next = () => setIdx((i) => Math.min(i + 1, total - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);
    setSubmitting(true);
    setErr("");
    try {
      const result = await submitAttempt(attemptId, { time_taken_seconds: timeTaken });
      onSubmitted({
        ...result,
        quizId,
        quizTitle,
        userName,
        time_taken_seconds: timeTaken,
      });
    } catch (e) {
      setErr(e.message || "Failed to submit attempt");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading questions…</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{quizTitle || `Quiz #${quizId}`}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Player: {userName}</div>
        </div>
        <button className="theme-toggle" style={{ position: "static", padding: "8px 14px" }} onClick={onExit}>
          Exit
        </button>
      </div>

      {err && (
        <div role="alert" style={{ background: "#ffd6d6", color: "#7a0000", padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {current ? (
        <div style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 16, background: "var(--bg-secondary)", textAlign: "left" }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>
            Question {idx + 1} of {total}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{current.text}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {options.map((opt) => {
              const selected = answers[current.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => selectOption(opt.key)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: selected ? "2px solid var(--text-secondary)" : "1px solid var(--border-color)",
                    background: selected ? "rgba(97, 218, 251, 0.15)" : "var(--bg-primary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <strong style={{ marginRight: 8 }}>{opt.key}.</strong> {opt.text}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 8, flexWrap: "wrap" }}>
            <button className="theme-toggle" style={{ position: "static", padding: "8px 14px" }} onClick={prev} disabled={idx === 0}>
              ← Previous
            </button>
            {idx < total - 1 ? (
              <button className="theme-toggle" style={{ position: "static", padding: "8px 14px" }} onClick={next}>
                Next →
              </button>
            ) : (
              <button
                className="theme-toggle"
                style={{ position: "static", padding: "8px 14px", backgroundColor: "#28a745" }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>No questions found.</div>
      )}
    </div>
  );
}
