# PacBoom agent protocol v1

This document teaches an external coding agent how to implement a player. It does
not grant execution permissions or train a model. The supplied example is a
deterministic bot, not an LLM. Run your own agent process on your own infrastructure.
The PacBoom server never evaluates submitted code.

## Objective and rules

Two players collect pellets in the same 15×9 grid. Coordinates start at (0,0),
top-left; x increases right, y down. `#` is a wall. Both players see the same full
map and positions. Every server tick (100 ms), each can move one cell up, down,
left or right, or stay. Walls block movement. Players can overlap and cross.
A pellet is worth 10 points; simultaneous collection splits it 5/5. Highest score
wins when no pellets remain or after 600 ticks. Equal scores produce `winner: "draw"`.
There is no combat, randomness, purchasing or token payout in this prototype.
For a rated tournament, alternate starting positions over two legs; this demo
does not implement rating or tournament fairness across strategies.

## Create and join

Base URL locally: `http://127.0.0.1:3101`.

1. `POST /matches` with JSON `{"mode":"external"}` creates a waiting duel.
   Response: `{id, joinToken, token:null, slot:null}`. Keep `joinToken` private.
2. Give the match ID and invitation to each of two agent processes.
3. Each calls `POST /matches/{id}/join` with JSON `{}` and
   `Authorization: Bearer <joinToken>`.
4. Each receives its own `{slot, token}`. Slots are 0 and 1. The second join starts
   the match. A third join returns 409. Never share a player's token.

`human` mode reserves slot 0 for the creator (token in create response) and uses
the built-in cautious bot in slot 1. An external process can also use this token
to control that slot for practice. `bots` starts two built-in bots automatically.

## Observe and act

`GET /matches/{id}` is spectator-readable and returns protocol version, tick,
tickMs, remainingMs, status (`waiting`, `running`, `finished`), map (rows of text),
players (`[{x,y,score}, ...]`), pellets (`[[x,y], ...]`), controllers, legal action
names and winner (null while unfinished, then 0, 1 or `"draw"`). Tokens are omitted.

While running, choose one action and send:

```http
POST /matches/{id}/actions
Authorization: Bearer <player-token>
Content-Type: application/json

{"tick": 12, "action": "right"}
```

`tick` must equal the observed tick plus one. Only `up`, `down`, `left`, `right`,
`stay` are legal. One accepted command per player per tick; extra requests return
429. Accepted commands return 202. Late commands return 409: fetch a fresh state
and retry for the next tick. No command means stay; commands do not repeat.
The server advances independently of agents. A disconnected agent stays still.
Sending score, position, slot or winner fields cannot modify the server state.
Invalid tokens return 401, invalid actions/JSON 400, oversized bodies 413,
expired/missing matches 404, full server 503. Stop when finished or 404.

HTTP polling is deliberately simple for the local prototype. Network latency
affects missed ticks. A public competitive release needs a measured input-delay
policy and faster transport such as WebSocket, not a claim of internet fairness.

## Run the example

Start `npm run arena`, create an external match:

```sh
curl -X POST http://127.0.0.1:3101/matches \
  -H 'Content-Type: application/json' -d '{"mode":"external"}'
```

In two terminals, replace the placeholders with the returned values:

```sh
PACBOOM_JOIN_TOKEN='<joinToken>' node arena/agent.mjs http://127.0.0.1:3101 '<id>' collector
PACBOOM_JOIN_TOKEN='<joinToken>' node arena/agent.mjs http://127.0.0.1:3101 '<id>' cautious
```

Watch `http://127.0.0.1:3101/?match=<id>`. The URL contains no control token.
Change the example's decision function to implement your own strategy. Agents
must understand the complete map; the example imports the fixed map from engine.mjs.
For a future variable-map protocol, derive pathfinding from the observation.

## Boundaries

No hosted code execution, LLM provider integration, self-training loop, replay
storage or account binding is included. A future AI workshop can generate a
policy and evaluate it in an isolated runtime; it must not execute untrusted
code in this game server. All participants have identical movement limits.
Rooms live in memory, expire five minutes after finishing (15 minutes maximum
since creation), and disappear on restart. A maximum of 64 rooms is enforced.
Treat invitation/player tokens as credentials; use HTTPS outside localhost.
