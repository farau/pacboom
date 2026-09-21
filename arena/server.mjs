import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createGame, observation, step, botAction, DIRECTIONS, TICK_MS } from './engine.mjs';

export function createArenaServer() {
  const rooms = new Map();
  const json = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  };
  async function body(req) {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 2048) throw Object.assign(new Error('Body too large'), { status: 413 });
    }
    try {
      const parsed = JSON.parse(raw || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected object');
      return parsed;
    } catch { throw Object.assign(new Error('Expected a JSON object'), { status: 400 }); }
  }
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      // Browser mutations must come from this origin. No permissive CORS.
      if (req.method === 'POST' && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)
        return json(res, 403, { error: 'Cross-origin request rejected' });
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/ui.js')) {
        res.writeHead(200, { 'Content-Type': url.pathname === '/' ? 'text/html; charset=utf-8' : 'text/javascript',
          'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'none'" });
        return res.end(await readFile(new URL(url.pathname === '/' ? './public/index.html' : './public/ui.js', import.meta.url)));
      }
      if (req.method === 'POST' && url.pathname === '/matches') {
        const input = await body(req);
        if (!['human', 'bots', 'external'].includes(input.mode)) return json(res, 400, { error: 'mode: human, bots or external' });
        if (rooms.size >= 64) return json(res, 503, { error: 'Arena full. Retry later.' });
        const id = randomUUID(), game = createGame();
        const slots = input.mode === 'bots' ? ['collector', 'cautious'] : input.mode === 'human' ? ['human', 'cautious'] : [null, null];
        if (input.mode === 'external') game.status = 'waiting';
        const token = input.mode === 'human' ? randomUUID() : null;
        const joinToken = input.mode === 'external' ? randomUUID() : null;
        rooms.set(id, { game, slots, tokens: [token, null], joinToken, pending: new Map(), created: Date.now(), ended: null });
        return json(res, 201, { id, token, joinToken, slot: token ? 0 : null });
      }
      const match = url.pathname.match(/^\/matches\/([\w-]+)(?:\/(join|actions))?$/);
      if (!match) return json(res, 404, { error: 'Not found' });
      const room = rooms.get(match[1]);
      if (!room) return json(res, 404, { error: 'Match expired or missing' });
      if (req.method === 'GET' && !match[2]) return json(res, 200, { id: match[1], ...observation(room.game), controllers: room.slots });
      const token = req.headers.authorization?.replace(/^Bearer /, '');
      if (req.method === 'POST' && match[2] === 'join') {
        if (!room.joinToken || token !== room.joinToken) return json(res, 401, { error: 'Invalid invitation' });
        const slot = room.slots.indexOf(null);
        if (slot < 0) return json(res, 409, { error: 'Match full' });
        const playerToken = randomUUID();
        room.slots[slot] = 'external'; room.tokens[slot] = playerToken;
        if (room.slots.every(Boolean)) room.game.status = 'running';
        return json(res, 200, { slot, token: playerToken });
      }
      if (req.method === 'POST' && match[2] === 'actions') {
        const slot = token ? room.tokens.indexOf(token) : -1;
        if (slot < 0) return json(res, 401, { error: 'Invalid player token' });
        const input = await body(req);
        if (!input || !Object.hasOwn(DIRECTIONS, input.action)) return json(res, 400, { error: 'Invalid action' });
        if (room.game.status !== 'running' || input.tick !== room.game.tick + 1)
          return json(res, 409, { error: 'Match not running or stale tick; fetch observation again' });
        if (room.pending.has(slot)) return json(res, 429, { error: 'One action per tick' });
        room.pending.set(slot, input.action);
        return json(res, 202, { accepted: true });
      }
      return json(res, 405, { error: 'Method not allowed' });
    } catch (error) {
      json(res, error.status ?? 500, { error: error.status ? error.message : 'Request failed' });
    }
  });
  const timer = setInterval(() => {
    for (const [id, room] of rooms) {
      if (room.game.status === 'running') {
        const actions = room.slots.map((type, i) => ['collector', 'cautious'].includes(type)
          ? botAction(room.game, i, type) : room.pending.get(i) ?? 'stay');
        step(room.game, actions); room.pending.clear();
        if (room.game.status === 'finished') room.ended = Date.now();
      }
      if ((room.ended && Date.now() - room.ended > 300000) || Date.now() - room.created > 900000) rooms.delete(id);
    }
  }, TICK_MS);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3101), host = process.env.HOST ?? '127.0.0.1';
  createArenaServer().listen(port, host, () => console.log(`PacBoom arena: http://${host}:${port}`));
}
