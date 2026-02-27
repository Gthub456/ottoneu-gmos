import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";

type Latest = any;

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [latest, setLatest] = useState<Latest>(null);

  useEffect(() => {
    fetch("/api/status").then(r => r.json()).then(setStatus);
    fetch("/api/latestEvaluation").then(r => r.json()).then(setLatest);
  }, []);

  const evaln = latest?.evaluation;

  return (
    <>
      <Nav />
      <div className="container">
        <h1>{process.env.NEXT_PUBLIC_APP_NAME ?? "Ottoneu GMOS"}</h1>
        <p className="muted">
          Ingestion → normalization → metrics → decision engines → UI. Mode: <b>{status?.mode ?? "..."}</b>
        </p>

        <div className="actions" style={{ margin: "12px 0 24px" }}>
          <button onClick={async () => {
            await fetch("/api/ingest", { method: "POST" });
            const s = await fetch("/api/status").then(r => r.json());
            setStatus(s);
          }}>Run ingest</button>

          <button onClick={async () => {
            await fetch("/api/evaluate", { method: "POST" });
            const l = await fetch("/api/latestEvaluation").then(r => r.json());
            setLatest(l);
          }}>Run evaluation</button>
        </div>

        <div className="grid">
          <div className="card">
            <div className="muted">Total Salary</div>
            <div className="kpi">{evaln ? `$${evaln.totalSalary}` : "—"}</div>
          </div>
          <div className="card">
            <div className="muted">Total ROS Points</div>
            <div className="kpi">{evaln ? evaln.totalPoints : "—"}</div>
          </div>
          <div className="card">
            <div className="muted">Risk-Adj Surplus</div>
            <div className="kpi">{evaln ? evaln.riskAdjSurplus : "—"}</div>
          </div>
        </div>

        <h2 style={{ marginTop: 28 }}>Top assets (risk-adjusted)</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>Salary</th>
                <th>Proj ROS</th>
                <th>Repl</th>
                <th>Raw Surplus</th>
                <th>Risk Adj</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(latest?.items ?? []).slice(0, 12).map((it: any) => (
                <tr key={it.id}>
                  <td><b>{it.player?.name}</b></td>
                  <td><span className="badge">{it.position}</span></td>
                  <td>${it.salary}</td>
                  <td>{it.projPointsROS}</td>
                  <td>{it.replPointsROS}</td>
                  <td>{it.rawSurplus}</td>
                  <td><b>{it.riskAdjSurplus}</b></td>
                  <td><span className="badge">{it.keepCut}</span></td>
                </tr>
              ))}
              {!latest?.items?.length && (
                <tr><td colSpan={8} className="muted">Run ingest + evaluation to populate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
