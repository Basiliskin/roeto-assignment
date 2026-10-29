import type { Sound } from './sounds';

export interface SoundPlayer {
  play(sound: Sound): void;
}

export const silentSoundPlayer: SoundPlayer = { play: () => {} };

type Note = { freq: number; at: number; dur: number; type: OscillatorType; to?: number };

const NOTES: Record<Sound, Note[]> = {
  roll: [
    { freq: 320, at: 0, dur: 0.04, type: 'square' },
    { freq: 260, at: 0.06, dur: 0.04, type: 'square' },
    { freq: 380, at: 0.12, dur: 0.05, type: 'square' },
  ],
  bust: [{ freq: 330, to: 110, at: 0, dur: 0.6, type: 'sawtooth' }],
  hold: [
    { freq: 660, at: 0, dur: 0.15, type: 'sine' },
    { freq: 880, at: 0.1, dur: 0.25, type: 'sine' },
  ],
  win: [523, 659, 784, 1047].map((freq, i) => ({ freq, at: i * 0.12, dur: 0.3, type: 'triangle' })),
};

/** Synthesised with WebAudio: no audio files to ship or license. */
export function createWebAudioSoundPlayer(): SoundPlayer {
  if (typeof AudioContext === 'undefined') return silentSoundPlayer;
  let ctx: AudioContext | null = null;
  return {
    play(sound) {
      ctx ??= new AudioContext();
      // Browsers start the context suspended until a user gesture; every play follows one.
      void ctx.resume();
      const t0 = ctx.currentTime;
      for (const n of NOTES[sound]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = n.type;
        osc.frequency.setValueAtTime(n.freq, t0 + n.at);
        if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur);
        gain.gain.setValueAtTime(0.12, t0 + n.at);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + n.at + n.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + n.at);
        osc.stop(t0 + n.at + n.dur);
      }
    },
  };
}
