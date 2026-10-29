import { useCallback, useMemo, useState } from 'react';
import { loadMuted, saveMuted } from '../sound/mutePreference';
import { createWebAudioSoundPlayer, type SoundPlayer } from '../sound/soundPlayer';
import type { Sound } from '../sound/sounds';

/** Sound effects with a remembered mute switch (S11). Purely presentational. */
export function useSound(player?: SoundPlayer) {
  const audio = useMemo(() => player ?? createWebAudioSoundPlayer(), [player]);
  const [muted, setMuted] = useState(loadMuted);

  const play = useCallback(
    (sound: Sound | null) => {
      if (sound && !muted) audio.play(sound);
    },
    [audio, muted],
  );
  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      saveMuted(!m);
      return !m;
    });
  }, []);

  return { muted, play, toggleMuted };
}
