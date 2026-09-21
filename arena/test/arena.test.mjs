import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createGame, step, botAction, MAX_TICKS } from '../engine.mjs';
import { createArenaServer } from '../server.mjs';

test('walls block movement and the engine awards points only once', () => {
  const game = createGame();
  step(game, ['up', 'stay']); assert.equal(game.players[0].y, 1);
  step(game, ['right', 'stay']); assert.equal(game.players[0].score, 10);
  step(game, ['stay', 'stay']); assert.equal(game.players[0].score, 10);
});
test('simultaneous collection splits points fairly', () => {
  const game = createGame(); game.players[1] = { x: 3, y: 1, score: 0 };
  step(game, ['right', 'left']); assert.deepEqual(game.players.map(p => p.score), [5, 5]);
});
test('finished games are immutable and ties explicit', () => {
  const game = createGame(); game.tick = MAX_TICKS - 1;
  step(game, ['stay', 'stay']); assert.equal(game.winner, 'draw');
  const before = JSON.stringify(game); step(game, ['right', 'left']); assert.equal(JSON.stringify(game), before);
});
test('two bot policies complete a deterministic match with conserved points', () => {
  function run() {
    const game = createGame(), total = game.pellets.size * 10;
    while (game.status === 'running') step(game, [botAction(game, 0), botAction(game, 1, 'cautious')]);
    assert.equal(game.players.reduce((sum, p) => sum + p.score, 0) + game.pellets.size * 10, total);
    assert.ok(game.players.every(p => p.score > 0));
    return JSON.stringify({ players: game.players, tick: game.tick, winner: game.winner });
  }
  assert.equal(run(), run());
});
test('HTTP: invitations, auth, stale actions, spectator privacy and external duel', async t => {
  const server = createArenaServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, body, token) {
    const response = await fetch(base + path, { method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }
  assert.equal((await request('/matches', { mode: 'bad' })).status, 400);
  const { data: room } = await request('/matches', { mode: 'external' });
  const path = `/matches/${room.id}`;
  assert.equal((await request(path)).data.status, 'waiting');
  assert.equal((await request(`${path}/join`, {}, 'bad')).status, 401);
  const a = (await request(`${path}/join`, {}, room.joinToken)).data;
  assert.equal((await request(path)).data.status, 'waiting');
  const b = (await request(`${path}/join`, {}, room.joinToken)).data;
  assert.notEqual(a.token, b.token);
  assert.equal((await request(`${path}/join`, {}, room.joinToken)).status, 409);
  assert.equal((await request(`${path}/actions`, { tick: 1, action: 'right' })).status, 401);
  assert.equal((await request(`${path}/actions`, { tick: -1, action: 'right' }, a.token)).status, 409);
  assert.equal((await request(`${path}/actions`, { tick: 1, action: 'teleport' }, a.token)).status, 400);
  const state = (await request(path)).data;
  assert.equal(state.status, 'running');
  assert.equal(JSON.stringify(state).includes(a.token), false);
  assert.equal(JSON.stringify(state).includes(room.joinToken), false);
  // Both external participants act from the same observation; late commands may be rejected.
  const responses = await Promise.all([
    request(`${path}/actions`, { tick: state.tick + 1, action: 'right', score: 999999 }, a.token),
    request(`${path}/actions`, { tick: state.tick + 1, action: 'left' }, b.token),
  ]);
  responses.forEach(r => assert.ok([202, 409].includes(r.status)));
  await new Promise(resolve => setTimeout(resolve, 150));
  const later = (await request(path)).data;
  assert.ok(later.tick > state.tick);
  assert.ok(later.players.every(p => p.score <= 10));
  assert.ok(later.players.some(p => p.score === 10));
  const evil = await fetch(base + '/matches', { method: 'POST', headers: { Origin: 'https://unrelated.example' }, body: '{"mode":"bots"}' });
  assert.equal(evil.status, 403);
});
