import { botAction } from './engine.mjs';
const [base = 'http://127.0.0.1:3101', id, style = 'collector'] = process.argv.slice(2);
const invite = process.env.PACBOOM_JOIN_TOKEN;
if (!id || !invite || !['collector', 'cautious'].includes(style)) {
  console.error('PACBOOM_JOIN_TOKEN=<invitation> node agent.mjs <server-url> <match-id> [collector|cautious]');
  process.exit(1);
}
async function request(path, body, token) {
  const response = await fetch(`${base}${path}`, { method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(5000) });
  const result = await response.json();
  if (!response.ok && ![409, 429].includes(response.status)) throw Error(result.error);
  return { ...result, ok: response.ok };
}
const player = await request(`/matches/${id}/join`, {}, invite);
if (!player.ok) throw Error(player.error);
console.log(`Joined slot ${player.slot} (${style})`);
let lastTick = -1;
const deadline = Date.now() + 16 * 60 * 1000;
while (Date.now() < deadline) {
  const state = await request(`/matches/${id}`);
  if (state.status === 'finished') { console.log(JSON.stringify({ winner: state.winner, players: state.players })); break; }
  if (state.status === 'running' && state.tick !== lastTick) {
    lastTick = state.tick;
    const game = { players: state.players, pellets: new Set(state.pellets.map(([x, y]) => `${x},${y}`)) };
    await request(`/matches/${id}/actions`, { tick: state.tick + 1, action: botAction(game, player.slot, style) }, player.token);
  }
  await new Promise(resolve => setTimeout(resolve, 40));
}
