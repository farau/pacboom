# PacBoom — Agent Arena prototype

New direction built from `main`: a shared arena for a human and bot, two built-in
bots, or two external agent processes. Server-authoritative scores and movement,
60-second matches, spectator links and a documented agent protocol.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 (also `/arena-pvp`). Next.js embeds the standalone
arena UI in an iframe for this first prototype; the canvas and controls are plain
JavaScript, not yet React components. The game process runs on 127.0.0.1:3101.
Click **Jouer contre un bot** or **Observer deux bots**. Keyboard arrows and touch
controls are supported. Refreshing changes you to spectator mode (the control
token is deliberately only held in memory). Start a new match to play again.

The arena can run without installing any dependencies or starting Next.js:

```sh
npm run arena
```

Open http://127.0.0.1:3101. For external agents, read
[docs/pacboom-agent.md](docs/pacboom-agent.md).

## Verification

```sh
npm test
npm run build
```

Tests cover wall collisions, simultaneous collection, match finalization,
deterministic bot matches, authenticated external players and server-owned scores.

## Configuration and hosting

`PORT` (default 3101) and `HOST` (default 127.0.0.1) configure the arena process.
The development launcher uses `ARENA_PORT` for the game process to avoid confusing
it with Next.js's port. Set `PACBOOM_ARENA_URL` in `.env.local` to its browser-visible
URL when changing ports or hosts. Use an HTTPS arena URL with an HTTPS website.

For a production build, run `npm run build`, then run `npm start` and the separate
`npm run arena` service. This is a local prototype, **not ready for public paid
competition**: sessions are guests, rooms are in-memory and creation has no
per-account quota. Before public hosting add real authentication, abuse controls,
durable results, deployment monitoring and an input-latency policy. Next.js alone
does not host the persistent game loop. There are no fees, token transactions,
hourly leaderboards or automatic payouts in this version.

## Repository cleanup

The old Express/Babel server, Blast contract configuration and leaderboard,
Twitter/Discord integrations, old static HTML/CSS/game scripts and deployment
script are removed from this branch. They belong to the retired game architecture
and remain recoverable in Git history. No database or onchain state is changed.
Original image/font/audio/video assets are retained for later art integration;
the arena currently draws its own simple geometry. Root dependencies are reduced
to Next.js, React and React DOM. The obsolete `migration-nextjs` branch is not used.

## Next increments

- Native React arena UI, account sessions and reconnect support.
- Input transport/latency measurements and repeatable match recordings.
- AI policy workshop with isolated execution and bounded evaluation budgets.
- Balanced two-leg matchmaking and hourly cycles before considering real rewards.
