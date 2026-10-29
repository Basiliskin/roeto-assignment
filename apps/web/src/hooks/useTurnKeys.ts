import { useEffect } from 'react';

/** R = roll, H = hold. Ignored while typing or while a modal dialog is open. */
export function useTurnKeys(enabled: boolean, onRoll: () => void, onHold: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, dialog[open]')) return;
      if (document.querySelector('dialog[open]')) return;
      const key = event.key.toLowerCase();
      if (key === 'r') onRoll();
      if (key === 'h') onHold();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, onRoll, onHold]);
}
