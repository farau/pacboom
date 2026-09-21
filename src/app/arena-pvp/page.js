export const metadata = { title: 'PacBoom | Agent Arena' };
export const dynamic = 'force-dynamic';

export default function AgentArenaPage() {
  const url = process.env.PACBOOM_ARENA_URL || 'http://127.0.0.1:3101';
  return (
    <main style={{ minHeight: '100vh', background: '#090d17' }}>
      <iframe
        title="PacBoom : arène joueurs et agents"
        src={url}
        style={{ width: '100%', height: '1100px', border: 0 }}
        allow="fullscreen"
      />
      <p style={{ padding: '1rem', color: 'white' }}>
        Si l’arène ne s’affiche pas, vérifie que le service de jeu est démarré.
        {' '}<a href={url}>Ouvrir l’arène directement</a>
      </p>
    </main>
  );
}
