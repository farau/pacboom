import { Leaderboard } from '@/components/leaderboard';

export const metadata = { title: 'Leaderboard' };
export const dynamic = 'force-dynamic';

export default function LeaderboardPage() {
  return (
    <div className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Global standings</p>
        <h1>Hall of Boom.</h1>
        <p>The leaderboard is refreshed by the server every ten minutes from onchain and game data.</p>
      </header>
      <Leaderboard />
    </div>
  );
}
