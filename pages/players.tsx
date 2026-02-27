import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";

export default function Players() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/players").then(r => r.json()).then(setData);
  }, []);

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Players</h1>
        <p className="muted">Season: {data?.season ?? "…"}</p>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Positions</th>
                <th>Proj ROS</th>
                <th>Salary (if rostered)</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {(data?.players ?? []).map((p: any) => (
                <tr key={p.id}>
                  <td><b>{p.name}</b></td>
                  <td>{p.positions.map((x: any) => x.position).join(", ")}</td>
                  <td>{p.projections[0]?.pointsROS ?? "—"}</td>
                  <td>{p.rosters[0]?.salary != null ? `$${p.rosters[0].salary}` : "—"}</td>
                  <td><span className="badge">{p.projections[0]?.source ?? "—"}</span></td>
                </tr>
              ))}
              {!data?.players?.length && (
                <tr><td colSpan={5} className="muted">No players yet. Run ingest.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
