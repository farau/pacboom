'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SOUNDTRACK = '/sound/Pac-Man%20Remix%20REMASTERED.mp3';

export function SiteSoundtrack() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || playingRef.current) return;
    audio.volume = 0.18;
    void audio.play().then(() => {
      playingRef.current = true;
      setPlaying(true);
    }).catch(() => undefined);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    playingRef.current = false;
    setPlaying(false);
  }, []);

  useEffect(() => {
    const audio = new Audio(SOUNDTRACK);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    function unlock(event: Event) {
      if (event.target instanceof Element && event.target.closest('.site-soundtrack')) return;
      play();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    }

    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      audio.pause();
    };
  }, [play]);

  return (
    <button
      className={playing ? 'site-soundtrack is-playing' : 'site-soundtrack'}
      type="button"
      aria-label={playing ? 'Pause background music' : 'Play background music'}
      aria-pressed={playing}
      onClick={playing ? pause : play}
    >
      <span className="soundtrack-bars" aria-hidden="true"><i /><i /><i /></span>
      <span>{playing ? 'Music on' : 'Play music'}</span>
    </button>
  );
}
