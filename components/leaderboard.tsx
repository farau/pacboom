'use client';

import { useEffect, useState } from 'react';

type Entry = { address?: string; username?: string; score?: number; points?: number; boost?: number };

export function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [updated, setUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/getLeaderboard?page=${page}&pageSize=10`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setEntries(data.leaderboard ?? []);
        setUpdated(data.last_refresh ?? null);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <section className="panel full">
      <div className="game-topline">
        <span>Top players</span>
        <span>{updated ? `Updated ${new Date(updated).toLocaleString()}` : 'Live data'}</span>
      </div>
      {loading ? <p className="empty-state">Loading standings…</p> : entries.length ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>PB points</th><th>Boost</th></tr></thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.address ?? `${page}-${index}`}>
                  <td className="rank">#{(page - 1) * 10 + index + 1}</td>
                  <td>{entry.username || (entry.address ? `${entry.address.slice(0, 6)}…${entry.address.slice(-4)}` : 'Anonymous')}</td>
                  <td>{Number(entry.score ?? 0).toLocaleString()}</td>
                  <td>{Number(entry.points ?? 0).toLocaleString()}</td>
                  <td>×{entry.boost ?? 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="empty-state">The leaderboard is unavailable while the database synchronizes.</p>}
      <div className="form-row" style={{ marginTop: 22 }}>
        <button className="button secondary" type="button" disabled={page === 1} onClick={() => { setLoading(true); setPage((value) => Math.max(1, value - 1)); }}>Previous</button>
        <button className="button primary" type="button" disabled={entries.length < 10} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Next page</button>
      </div>
    </section>
  );
}
