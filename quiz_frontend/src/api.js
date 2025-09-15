const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

// PUBLIC_INTERFACE
export async function fetchQuizzes() {
  /** Fetch list of quizzes from backend. */
  const res = await fetch(`${API_BASE}/quizzes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch quizzes: ${res.status}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchQuestions(quizId) {
  /** Fetch questions for a given quiz. */
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/questions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch questions for quiz ${quizId}: ${res.status}`);
  }
  return res.json(); // { questions: [...] }
}

// PUBLIC_INTERFACE
export async function startAttempt({ user_name, quiz_id }) {
  /** Start a quiz attempt; returns { attempt_id }. */
  const res = await fetch(`${API_BASE}/attempts/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name, quiz_id }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to start attempt: ${res.status} ${txt}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function answerQuestion(attemptId, { question_id, selected_option }) {
  /** Record or update an answer for a question in an attempt. */
  const res = await fetch(`${API_BASE}/attempts/${attemptId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id, selected_option }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to record answer: ${res.status} ${txt}`);
  }
  // endpoint returns empty schema; still parse to maintain consistency
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// PUBLIC_INTERFACE
export async function submitAttempt(attemptId, { time_taken_seconds = null } = {}) {
  /** Submit the attempt and get the score summary. */
  const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_taken_seconds }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to submit attempt: ${res.status} ${txt}`);
  }
  return res.json(); // { attempt_id, score, total_questions }
}

// PUBLIC_INTERFACE
export async function getAttemptStatus(attemptId) {
  /** Get attempt status including answers_count and submission details. */
  const res = await fetch(`${API_BASE}/attempts/${attemptId}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to get attempt status: ${res.status} ${txt}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchLeaderboard(limit = 20) {
  /** Fetch leaderboard results with optional limit. */
  const url = new URL(`${API_BASE}/leaderboard`, window.location.origin);
  // If absolute URL, build manually
  const endpoint =
    API_BASE.startsWith("http") || API_BASE.startsWith("//")
      ? `${API_BASE}/leaderboard?limit=${encodeURIComponent(limit)}`
      : `/leaderboard?limit=${encodeURIComponent(limit)}`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  }
  return res.json(); // { results: [...] }
}

export default {
  fetchQuizzes,
  fetchQuestions,
  startAttempt,
  answerQuestion,
  submitAttempt,
  getAttemptStatus,
  fetchLeaderboard,
};
