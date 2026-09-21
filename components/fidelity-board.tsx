'use client';

import { useEffect, useState } from 'react';

type Fidelity = { username?: string; pac_fidelity?: number; avatarurl?: string };

export function FidelityBoard() {
  const [rows, setRows] = useState<Fidelity[]>([]);
  useEffect(() => {
    fetch('/getFidelityboard').then((response) => response.ok ? response.json() : []).then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <section className="panel full">
      {rows.length ? <table className="data-table"><thead><tr><th>Rank</th><th>Member</th><th>Fidelity</th></tr></thead><tbody>
        {rows.map((row, index) => <tr key={`${row.username}-${index}`}><td className="rank">#{index + 1}</td><td>{row.username ?? 'Anonymous'}</td><td>{row.pac_fidelity ?? 0}</td></tr>)}
      </tbody></table> : <p className="empty-state">No fidelity data is available yet.</p>}
    </section>
  );
}
