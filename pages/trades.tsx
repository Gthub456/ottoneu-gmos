import { useMemo, useState } from "react";
import { Nav } from "../components/Nav";

type Side = { name: string; riskAdjSurplus: number };

export default function Trades() {
  const [giveText, setGiveText] = useState("PlayerA, 5\nPlayerB, 2");
  const [getText, setGetText] = useState("PlayerX, 6\nPlayerY, 4");

  const parsed = useMemo(() => {
    const parse = (txt: string): Side[] =>
      txt.split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          const [name, val] = l.split(",").map(x => x.trim());
          return { name, riskAdjSurplus: Number(val || "0") };
        });
    return { give: parse(giveText), get: parse(getText) };
  }, [giveText, getText]);

  const result = useMemo(() => {
    const sum = (xs: Side[]) => xs.reduce((a,b)=>a+b.riskAdjSurplus,0);
    const give = sum(parsed.give);
    const get = sum(parsed.get);
    const friction = 1.0;
    const delta = Math.round((get - give - friction) * 100) / 100;
    const verdict = delta >= 2 ? "ACCEPT" : delta <= -1 ? "PASS" : "NEED SWEETENER";
    return { give, get, delta, verdict };
  }, [parsed]);

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Trade Evaluator (MVP)</h1>
        <p className="muted">Paste “Name, riskAdjSurplus” lines. This mirrors the decision engine logic.</p>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="card">
            <h3>You GIVE</h3>
            <textarea rows={10} value={giveText} onChange={e => setGiveText(e.target.value)} />
          </div>
          <div className="card">
            <h3>You GET</h3>
            <textarea rows={10} value={getText} onChange={e => setGetText(e.target.value)} />
          </div>
          <div className="card">
            <h3>Result</h3>
            <div className="muted">Give sum</div>
            <div className="kpi">{result.give}</div>
            <div className="muted" style={{ marginTop: 10 }}>Get sum</div>
            <div className="kpi">{result.get}</div>
            <div className="muted" style={{ marginTop: 10 }}>Delta (after friction)</div>
            <div className="kpi">{result.delta}</div>
            <div style={{ marginTop: 10 }}><span className="badge">{result.verdict}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
