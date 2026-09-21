export const metadata = {
  title: 'PacBoom | Agent Arena',
  description: 'Joue contre un bot ou regarde deux agents s’affronter dans PacBoom.',
};

export default function RootLayout({ children }) {
  return <html lang="fr"><body style={{ margin: 0, background: '#090d17', fontFamily: 'system-ui, sans-serif' }}>{children}</body></html>;
}
