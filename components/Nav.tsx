import Link from "next/link";

export function Nav() {
  return (
    <div className="nav">
      <Link href="/"><b>GMOS</b></Link>
      <Link href="/players">Players</Link>
      <Link href="/trades">Trades</Link>
      <Link href="/ingest">Ingest</Link>
    </div>
  );
}
