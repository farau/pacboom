import Image from 'next/image';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="content-page">
      <header className="content-hero">
        <p className="eyebrow">The story</p>
        <h1>Arcade energy.<br />Onchain stakes.</h1>
        <p>PacBoom combines a fast browser arcade game with onchain rewards, collectible PacNubs, and community challenges on Blast.</p>
      </header>
      <div className="panel-grid">
        <article className="panel">
          <p className="eyebrow">01 · Play</p>
          <h2>A real game first</h2>
          <p>Your score comes from movement, timing, and knowing which characters help or hurt your run. The board speeds up as you progress.</p>
        </article>
        <article className="panel">
          <p className="eyebrow">02 · Earn</p>
          <h2>Wallet-native rewards</h2>
          <p>RainbowKit connects any supported wallet. Signed game sessions let the server validate scores before a claim reaches the contract.</p>
        </article>
        <article className="panel full">
          <div className="page-grid" style={{ width: '100%' }}>
            <div>
              <p className="eyebrow">The ecosystem</p>
              <h2>Built for the Blast community</h2>
              <p>Play for a high score, claim PB points onchain, and personalize your identity with the PacBoom Army collection.</p>
            </div>
            <Image src="/img/artwork-pacboom.png" alt="PacBoom artwork" width={520} height={420} style={{ objectFit: 'contain' }} />
          </div>
        </article>
      </div>
    </div>
  );
}
