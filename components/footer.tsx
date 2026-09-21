import Image from 'next/image';

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">Built on Blast</p>
        <p>© {new Date().getFullYear()} PacBoom</p>
      </div>
      <div className="footer-links">
        <a href="https://t.me/+wPZIcMLFQxBkNWRk" target="_blank" rel="noreferrer">Telegram</a>
        <a href="https://discord.gg/cXBe9u7vmD" target="_blank" rel="noreferrer">Discord</a>
        <a href="https://x.com/pacboom_" target="_blank" rel="noreferrer">X / Twitter</a>
      </div>
      <Image src="/img/blast_logo.svg" alt="Blast" width={142} height={40} />
    </footer>
  );
}
