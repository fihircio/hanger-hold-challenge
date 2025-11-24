import { useEffect } from 'react';

/**
 * useIdleTimer
 * Calls `onIdle` when there has been no user activity for `timeoutMs` milliseconds.
 * Listens to mouse, touch, keyboard and wheel events.
 */
export function useIdleTimer(onIdle: () => void, timeoutMs = 60000, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;

    const reset = () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        onIdle();
      }, timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'touchstart',
      'keydown',
      'wheel',
    ];

    events.forEach((ev) => window.addEventListener(ev, reset, true));

    // start timer
    reset();

    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset, true));
    };
  }, [onIdle, timeoutMs, enabled]);
}
