import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="content-page">
      <header className="content-hero">
        <p className="eyebrow">404</p>
        <h1>Lost in the maze.</h1>
        <p>This route has already been eaten.</p>
      </header>
      <Link className="button primary" href="/">Back to the game</Link>
    </div>
  );
}
