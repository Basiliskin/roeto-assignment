const KEY = 'dice.soundMuted';

/** Per-browser convenience; storage may be unavailable (private mode), so default to sound on. */
export function loadMuted(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): boolean {
  try {
    return storage?.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function saveMuted(
  muted: boolean,
  storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage,
): void {
  try {
    storage?.setItem(KEY, muted ? '1' : '0');
  } catch {
    // Not remembered; the toggle still works for this page load.
  }
}
