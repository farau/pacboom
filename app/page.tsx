import Image from 'next/image';
import { GameCanvas } from '@/components/game/game-canvas';

export const dynamic = 'force-dynamic';

const rewards = [
  { image: '/img/ghost.png', name: 'Ghost', text: 'Eat it to get 100 points.', tone: 'cyan' },
  { image: '/img/konk.webp', name: 'Konk', text: "Don't touch him or you will die!", tone: 'red' },
  { image: '/img/adam.png', name: 'Adam', text: 'Get 500 points and temporarily eat Konk.', tone: 'green' },
  { image: '/img/gift.png', name: 'Gift', text: 'Catch it to get 300 points.', tone: 'yellow' },
  { image: '/img/satsy.jpg', name: 'Satsy', text: 'It will slow you down.', tone: 'purple' },
  { image: '/img/jenndefer.png', name: 'Jenndefer', text: 'Get 1000 points, but become bigger.', tone: 'pink' },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="legacy-home">
        <div className="legacy-game-column">
          <GameCanvas />
        </div>
        <aside className="legacy-how-to">
          <p className="legacy-kicker">PACBOOM · BLAST ARCADE</p>
          <h1>How to play?</h1>
          <p>Connect your wallet, eat the enemies, and score high to earn PacBoom points!</p>
          <p>Claim your PB points onchain, improve your runs, and climb the leaderboard.</p>
          <ul className="legacy-encounters">
            {rewards.map((reward) => (
              <li className={reward.tone} key={reward.name}>
                <Image src={reward.image} alt="" width={34} height={34} />
                <p><strong>{reward.name}:</strong> {reward.text}</p>
              </li>
            ))}
          </ul>
          <div className="legacy-controls">
            <h2>Controls</h2>
            <p><strong>Desktop:</strong> arrows to move · hold Space to boost.</p>
            <p><strong>Smartphone:</strong> swipe to move.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
