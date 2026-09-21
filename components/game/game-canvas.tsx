'use client';

/* eslint-disable react-hooks/immutability -- The canvas engine intentionally keeps frame state in a mutable ref. */

import { useCallback, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import { useWalletSession } from '@/components/wallet-session';
import { ClaimModal } from './claim-modal';

const SIZE = 560;
const PLAYER_START_SIZE = 19;

type Direction = 'up' | 'down' | 'left' | 'right';
type EntityKind = 'ghost' | 'konk' | 'adam' | 'gift' | 'satsy' | 'jenndefer';
type Entity = { x: number; y: number; size: number; speed: number; angle: number; kind: EntityKind };
type GameState = {
  running: boolean;
  playerX: number;
  playerY: number;
  playerSize: number;
  direction: Direction;
  score: number;
  boost: boolean;
  entities: Entity[];
  invincibleUntil: number;
  slowUntil: number;
  bigUntil: number;
  lastFrame: number;
  mouth: number;
};

const sprites: Record<EntityKind, string> = {
  ghost: '/img/ghost.png',
  konk: '/img/konk.webp',
  adam: '/img/adam.png',
  gift: '/img/gift.png',
  satsy: '/img/satsy.jpg',
  jenndefer: '/img/jenndefer.png',
};

const points: Partial<Record<EntityKind, number>> = {
  ghost: 100,
  adam: 500,
  gift: 300,
  jenndefer: 1000,
};

function randomKind(): EntityKind {
  const roll = Math.random() * 100;
  if (roll < 48) return 'ghost';
  if (roll < 65) return 'konk';
  if (roll < 74) return 'gift';
  if (roll < 84) return 'adam';
  if (roll < 93) return 'satsy';
  return 'jenndefer';
}

function spawnEntity(avoidX = SIZE / 2, avoidY = SIZE / 2): Entity {
  let x = Math.random() * (SIZE - 80) + 40;
  let y = Math.random() * (SIZE - 80) + 40;
  while (Math.hypot(x - avoidX, y - avoidY) < 140) {
    x = Math.random() * (SIZE - 80) + 40;
    y = Math.random() * (SIZE - 80) + 40;
  }
  const kind = randomKind();
  return {
    x,
    y,
    kind,
    size: kind === 'konk' ? 16 : 21,
    speed: 65 + Math.random() * 45,
    angle: Math.random() * Math.PI * 2,
  };
}

function freshGame(): GameState {
  return {
    running: false,
    playerX: SIZE / 2,
    playerY: SIZE / 2,
    playerSize: PLAYER_START_SIZE,
    direction: 'right',
    score: 0,
    boost: false,
    entities: Array.from({ length: 6 }, () => spawnEntity()),
    invincibleUntil: 0,
    slowUntil: 0,
    bigUntil: 0,
    lastFrame: 0,
    mouth: 0.28,
  };
}

function safeAudio(path: string, volume = 0.35) {
  const audio = new Audio(path);
  audio.volume = volume;
  void audio.play().catch(() => undefined);
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const stateRef = useRef<GameState>(freshGame());
  const imagesRef = useRef<Partial<Record<EntityKind, HTMLImageElement>>>({});
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const boostAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameOverTimerRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(true);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [exploding, setExploding] = useState(false);
  const session = useWalletSession();

  const stopGameAudio = useCallback(() => {
    for (const audio of [boostAudioRef.current]) {
      if (!audio) continue;
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const playEffect = useCallback((path: string, volume?: number) => {
    if (soundEnabledRef.current) safeAudio(path, volume);
  }, []);

  const finish = useCallback(async () => {
    const game = stateRef.current;
    if (!game.running) return;
    game.running = false;
    setRunning(false);
    stopGameAudio();
    setExploding(true);
    playEffect('/sound/sf_explosion_01.mp3', 0.7);
    window.setTimeout(() => playEffect('/sound/pacman_death.wav', 0.45), 140);
    navigator.vibrate?.(200);
    gameOverTimerRef.current = window.setTimeout(() => {
      setExploding(false);
      setFinalScore(game.score);
    }, 720);

    if (session.status === 'authenticated') {
      await Promise.allSettled([
        fetch('/save-score', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: game.score }),
        }),
        fetch('/saveScore', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: game.score }),
        }),
      ]);
    }
  }, [playEffect, session.status, stopGameAudio]);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const game = stateRef.current;
    const dt = Math.min((time - (game.lastFrame || time)) / 1000, 0.034);
    game.lastFrame = time;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#090c16';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = 'rgba(255, 242, 0, .07)';
    ctx.lineWidth = 1;
    for (let n = 20; n < SIZE; n += 40) {
      ctx.beginPath(); ctx.moveTo(n, 0); ctx.lineTo(n, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, n); ctx.lineTo(SIZE, n); ctx.stroke();
    }

    if (game.running) {
      const now = Date.now();
      const baseSpeed = now < game.slowUntil ? 90 : 150;
      const speed = baseSpeed * (game.boost ? 1.75 : 1) * dt;
      if (game.direction === 'left') game.playerX -= speed;
      if (game.direction === 'right') game.playerX += speed;
      if (game.direction === 'up') game.playerY -= speed;
      if (game.direction === 'down') game.playerY += speed;
      game.playerX = Math.max(game.playerSize, Math.min(SIZE - game.playerSize, game.playerX));
      game.playerY = Math.max(game.playerSize, Math.min(SIZE - game.playerSize, game.playerY));
      game.playerSize = now < game.bigUntil ? 35 : PLAYER_START_SIZE;

      for (const entity of game.entities) {
        const difficulty = 1 + Math.min(game.score / 40000, 1.8);
        entity.x += Math.cos(entity.angle) * entity.speed * difficulty * dt;
        entity.y += Math.sin(entity.angle) * entity.speed * difficulty * dt;
        if (entity.x < entity.size || entity.x > SIZE - entity.size) entity.angle = Math.PI - entity.angle;
        if (entity.y < entity.size || entity.y > SIZE - entity.size) entity.angle = -entity.angle;
        entity.x = Math.max(entity.size, Math.min(SIZE - entity.size, entity.x));
        entity.y = Math.max(entity.size, Math.min(SIZE - entity.size, entity.y));
      }

      for (let index = game.entities.length - 1; index >= 0; index--) {
        const entity = game.entities[index];
        if (Math.hypot(game.playerX - entity.x, game.playerY - entity.y) >= game.playerSize + entity.size) continue;
        if (entity.kind === 'konk' && now >= game.invincibleUntil) {
          void finish();
          break;
        }
        if (entity.kind === 'adam') game.invincibleUntil = now + 5200;
        if (entity.kind === 'satsy') game.slowUntil = now + 4300;
        if (entity.kind === 'jenndefer') game.bigUntil = now + 5000;
        game.score += points[entity.kind] ?? (entity.kind === 'konk' ? 500 : 0);
        setScore(game.score);
        playEffect(entity.kind === 'gift' ? '/sound/pacman_eatfruit.wav' : '/sound/pacman_eatghost.wav');
        game.entities.splice(index, 1, spawnEntity(game.playerX, game.playerY));
        if (game.score > 0 && game.score % 2000 === 0 && game.entities.length < 14) {
          game.entities.push(spawnEntity(game.playerX, game.playerY));
        }
      }
    }

    for (const entity of game.entities) {
      const image = imagesRef.current[entity.kind];
      if (image?.complete) {
        ctx.drawImage(image, entity.x - entity.size, entity.y - entity.size, entity.size * 2, entity.size * 2);
      }
    }

    const directionAngle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[game.direction];
    const powered = Date.now() < game.invincibleUntil;
    game.mouth = 0.22 + Math.abs(Math.sin(time / 95)) * 0.38;
    ctx.fillStyle = powered ? '#63ff8b' : '#fff200';
    ctx.shadowColor = powered ? '#63ff8b' : '#fff200';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(game.playerX, game.playerY, game.playerSize, directionAngle + game.mouth, directionAngle + Math.PI * 2 - game.mouth);
    ctx.lineTo(game.playerX, game.playerY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '700 16px system-ui';
    ctx.fillText(`SCORE  ${game.score.toString().padStart(6, '0')}`, 22, 34);
    if (Date.now() < game.slowUntil) ctx.fillText('SLOWED', 22, 58);
    if (Date.now() < game.invincibleUntil) ctx.fillText('POWER', 22, 58);

    frameRef.current = requestAnimationFrame(draw);
  }, [finish, playEffect]);

  useEffect(() => {
    const boost = new Audio('/sound/pacman_extrapac.wav');
    boost.preload = 'auto';
    boost.loop = true;
    boost.volume = 0.28;
    boostAudioRef.current = boost;
    return () => {
      boost.pause();
      if (gameOverTimerRef.current) window.clearTimeout(gameOverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    for (const [kind, src] of Object.entries(sprites) as [EntityKind, string][]) {
      const image = new Image();
      image.src = src;
      imagesRef.current[kind] = image;
    }
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [draw]);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      const directions: Partial<Record<string, Direction>> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      };
      if (directions[event.key]) {
        event.preventDefault();
        stateRef.current.direction = directions[event.key]!;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        stateRef.current.boost = event.type === 'keydown';
        const boostAudio = boostAudioRef.current;
        if (boostAudio && event.type === 'keydown' && !event.repeat && stateRef.current.running && soundEnabledRef.current) {
          void boostAudio.play().catch(() => undefined);
        }
        if (boostAudio && event.type === 'keyup') {
          boostAudio.pause();
          boostAudio.currentTime = 0;
        }
      }
    }
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', key);
    };
  }, []);

  async function start() {
    if (gameOverTimerRef.current) window.clearTimeout(gameOverTimerRef.current);
    setExploding(false);
    stateRef.current = { ...freshGame(), running: true, lastFrame: performance.now() };
    setScore(0);
    setFinalScore(null);
    setRunning(true);
    if (session.status === 'authenticated') {
      await fetch('/initialize-score', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    }
  }

  function toggleSound() {
    const enabled = !soundEnabledRef.current;
    soundEnabledRef.current = enabled;
    setSoundEnabled(enabled);
    if (!enabled) stopGameAudio();
  }

  function pointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const origin = pointerRef.current;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) > Math.abs(dy)) stateRef.current.direction = dx > 0 ? 'right' : 'left';
    else if (Math.abs(dy) > 10) stateRef.current.direction = dy > 0 ? 'down' : 'up';
    pointerRef.current = null;
  }

  return (
    <div className="game-frame">
      <div className="game-topline">
        <span>LIVE RUN</span>
        <button
          className="game-audio-button"
          type="button"
          aria-label={soundEnabled ? 'Mute game audio' : 'Enable game audio'}
          aria-pressed={!soundEnabled}
          onClick={toggleSound}
        >
          {soundEnabled ? '♪ FX on' : 'FX off'}
        </button>
        <strong>{score.toString().padStart(6, '0')}</strong>
      </div>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          aria-label="PacBoom game board"
          onPointerDown={pointerDown}
          onPointerUp={pointerUp}
        />
        {exploding && (
          <div className="game-over-boom" aria-label="Boom! Game over">
            <NextImage src="/img/boom.gif" alt="" width={420} height={420} unoptimized />
          </div>
        )}
        {!running && !exploding && (
          <div className="game-start">
            <span className="game-kicker">READY?</span>
            <button className="play-button" type="button" onClick={() => void start()}>
              <span>▶</span> Play now
            </button>
            <small>{session.status === 'authenticated' ? 'Score saving enabled' : 'Guest run · connect to claim'}</small>
          </div>
        )}
      </div>
      <div className="game-status">
        <span><i className="status-dot" /> Game online</span>
        <span>Season 01</span>
      </div>
      {finalScore !== null && <ClaimModal score={finalScore} onClose={() => setFinalScore(null)} />}
    </div>
  );
}
