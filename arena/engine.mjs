export const DIRECTIONS = Object.freeze({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], stay: [0, 0] });
export const TICK_MS = 100;
export const MAX_TICKS = 600;
export const MAP = [
  '###############',
  '#.............#',
  '#.###.#.#.###.#',
  '#.....#.#.....#',
  '#.###.....###.#',
  '#.....#.#.....#',
  '#.###.#.#.###.#',
  '#.............#',
  '###############',
];
export const key = (x, y) => `${x},${y}`;
export function createGame() {
  const players = [{ x: 1, y: 1, score: 0 }, { x: 13, y: 7, score: 0 }];
  const pellets = new Set();
  MAP.forEach((row, y) => [...row].forEach((tile, x) => {
    if (tile === '.' && !players.some(p => p.x === x && p.y === y)) pellets.add(key(x, y));
  }));
  return { tick: 0, status: 'running', players, pellets, winner: null };
}
export function destination(player, action) {
  const [dx, dy] = DIRECTIONS[action] ?? DIRECTIONS.stay;
  const x = player.x + dx, y = player.y + dy;
  return MAP[y]?.[x] === '.' ? { x, y } : { x: player.x, y: player.y };
}
export function step(game, actions) {
  if (game.status !== 'running') return;
  // Simultaneous movement: avatars may cross or overlap; shared pellets split equally.
  game.players.forEach((p, i) => Object.assign(p, destination(p, actions[i])));
  const cells = new Set(game.players.map(p => key(p.x, p.y)));
  for (const cell of cells) {
    if (!game.pellets.delete(cell)) continue;
    const collectors = game.players.filter(p => key(p.x, p.y) === cell);
    collectors.forEach(p => { p.score += 10 / collectors.length; });
  }
  game.tick++;
  if (!game.pellets.size || game.tick >= MAX_TICKS) {
    game.status = 'finished';
    const [a, b] = game.players;
    game.winner = a.score === b.score ? 'draw' : a.score > b.score ? 0 : 1;
  }
}
export function observation(game) {
  return { protocol: 1, tick: game.tick, tickMs: TICK_MS, remainingMs: Math.max(0, MAX_TICKS - game.tick) * TICK_MS,
    status: game.status, winner: game.winner, map: MAP, players: game.players.map(p => ({ ...p })),
    pellets: [...game.pellets].map(cell => cell.split(',').map(Number)), actions: Object.keys(DIRECTIONS) };
}
export function botAction(game, slot, style = 'collector') {
  const start = game.players[slot], opponent = game.players[1 - slot];
  const queue = [{ ...start, first: 'stay', distance: 0 }], seen = new Set([key(start.x, start.y)]);
  let best = null;
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (game.pellets.has(key(node.x, node.y))) {
      const contested = Math.abs(node.x - opponent.x) + Math.abs(node.y - opponent.y);
      const cost = node.distance + (style === 'cautious' && contested < 3 ? 4 : 0);
      if (!best || cost < best.cost) best = { action: node.first, cost };
    }
    for (const action of ['up', 'down', 'left', 'right']) {
      const next = destination(node, action), cell = key(next.x, next.y);
      if (seen.has(cell)) continue;
      seen.add(cell);
      queue.push({ ...next, first: node.distance ? node.first : action, distance: node.distance + 1 });
    }
  }
  return best?.action ?? 'stay';
}
