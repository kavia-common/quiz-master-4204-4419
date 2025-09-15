import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api";

// PUBLIC_INTERFACE
export default function Leaderboard({ limit = 20, onBack }) {
  /** Render top results leaderboard. */
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchLeaderboard(limit);
        if (isMounted) setData(res?.results || []);
      } catch (e) {
        if (isMounted) setErr(e.message || "Failed to load leaderboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [limit]);

  if (loading) return <div style={{ padding: 24 }}>Loading leaderboard…</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Leaderboard</h2>
        <button className="theme-toggle" style={{ position: "static", padding: "8px 14px" }} onClick={onBack}>
          Back
        </button>
      </div>

      {err && (
        <div role="alert" style={{ background: "#ffd6d6", color: "#7a0000", padding: "8px 12px", borderRadius: 8, marginTop: 12 }}>
          {err}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {data.length === 0 ? (
          <div style={{ color: "var(--text-secondary)" }}>No results yet.</div>
        ) : (
          <div style={{ border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 160px", gap: 0, background: "var(--bg-secondary)", padding: "10px 12px", fontWeight: 700 }}>
              <div>#</div>
              <div>Name</div>
              <div>Score</div>
              <div>Time (s)</div>
            </div>
            {data.map((row, i) => (
              <div
                key={row.id ?? `${row.user_name}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 120px 160px",
                  gap: 0,
                  padding: "10px 12px",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <div>{i + 1}</div>
                <div>{row.user_name}</div>
                <div>
                  {row.score} / {row.total_questions}
                </div>
                <div>{row.time_taken_seconds ?? "-"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
