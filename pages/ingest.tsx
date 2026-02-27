import { useState } from "react";
import { Nav } from "../components/Nav";

export default function IngestPage() {
  const [log, setLog] = useState<string>("");

  async function run(path: string) {
    setLog("Running…");
    const res = await fetch(path, { method: "POST" });
    const json = await res.json();
    setLog(JSON.stringify(json, null, 2));
  }

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Ingest</h1>
        <p className="muted">Runs ingest + evaluation from the UI.</p>

        <div className="actions" style={{ marginBottom: 12 }}>
          <button onClick={() => run("/api/ingest")}>Run ingest</button>
          <button onClick={() => run("/api/evaluate")}>Run evaluation</button>
        </div>

        <div className="card">
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{log}</pre>
        </div>
      </div>
    </>
  );
}
