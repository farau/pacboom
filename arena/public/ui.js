const $ = id => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d');
let matchId = new URLSearchParams(location.search).get('match'), token = null, action = 'stay', busy = false, lastTick = -1;
const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
addEventListener('keydown', event => { if (keys[event.key] && token) { event.preventDefault(); action = keys[event.key]; } });
addEventListener('keyup', event => { if (keys[event.key] === action) action = 'stay'; });
addEventListener('blur', () => { action = 'stay'; });
document.querySelectorAll('[data-action]').forEach(button => {
  button.style.touchAction = 'none';
  button.addEventListener('pointerdown', event => { button.setPointerCapture(event.pointerId); action = button.dataset.action; });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => { action = 'stay'; });
});
function draw(state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.map.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === '#') { ctx.fillStyle = '#273e66'; ctx.fillRect(x * 50 + 3, y * 50 + 3, 44, 44); }
  }));
  ctx.fillStyle = '#f0d880';
  for (const [x, y] of state.pellets) { ctx.beginPath(); ctx.arc(x * 50 + 25, y * 50 + 25, 4, 0, Math.PI * 2); ctx.fill(); }
  state.players.forEach((player, i) => {
    ctx.fillStyle = i ? '#f298e6' : '#70c8ff'; ctx.beginPath();
    ctx.arc(player.x * 50 + 25 + (i ? 4 : -4), player.y * 50 + 25, i ? 13 : 18, .2, Math.PI * 2 - .2); ctx.lineTo(player.x * 50 + 25, player.y * 50 + 25); ctx.fill();
    $(`score${i}`).textContent = player.score;
    $(`name${i}`).textContent = ({ human: 'Toi', collector: 'Bot Collecteur', cautious: 'Bot Prudent', external: `Agent ${i + 1}` })[state.controllers[i]] ?? 'En attente';
  });
  $('clock').textContent = `${Math.ceil(state.remainingMs / 1000)} s`;
  $('status').textContent = state.status === 'finished'
    ? state.winner === 'draw' ? 'Égalité !' : `${$(`name${state.winner}`).textContent} remporte le duel !`
    : state.status === 'waiting' ? 'En attente des deux agents…' : token ? 'À toi de jouer !' : 'Match en direct · mode spectateur';
}
async function start(mode) {
  document.querySelectorAll('.toolbar button').forEach(b => { b.disabled = true; });
  try {
    const response = await fetch('/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) });
    const result = await response.json(); if (!response.ok) throw Error(result.error);
    matchId = result.id; token = result.token; action = 'stay'; lastTick = -1;
    history.replaceState(null, '', `?match=${matchId}`);
    $('match').textContent = `Lien spectateur : ${location.href}`;
    $('error').textContent = '';
  } catch (error) { $('error').textContent = error.message; }
  finally { document.querySelectorAll('.toolbar button').forEach(b => { b.disabled = false; }); }
}
$('human').onclick = () => start('human'); $('bots').onclick = () => start('bots');
async function poll() {
  if (!matchId || busy) return;
  busy = true; const id = matchId;
  try {
    const response = await fetch(`/matches/${id}`), state = await response.json();
    if (id !== matchId) return;
    if (!response.ok) throw Error(state.error);
    draw(state); $('error').textContent = '';
    if (token && state.status === 'running' && state.tick !== lastTick) {
      lastTick = state.tick;
      const sent = await fetch(`/matches/${id}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ tick: state.tick + 1, action }) });
      if (!sent.ok && ![409, 429].includes(sent.status)) throw Error('Commande refusée. Relance une partie.');
    }
  } catch (error) { $('error').textContent = `Connexion : ${error.message}`; }
  finally { busy = false; }
}
setInterval(poll, 70); poll();
ctx.fillStyle = '#aebbd1'; ctx.font = '22px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Ton prochain duel commence ici.', 375, 225);
