import { setAsPortalHandler, type PortalHandler } from '@pastweb/tools/portals';
import { useRef } from '../useRef';

/**
 * Creates a portal handler that can be passed to the {@link Portal} component.
 *
 * Calls made before the `Portal` component binds the real handler are queued
 * and replayed when `isReady()` runs.
 *
 * @returns A portal handler with an internal `isReady` flush method.
 */
export function usePortal(): PortalHandler & { isReady: () => void } {
  const portal = useRef({});

  const called: Record<string, any> = {};

  const handler = setAsPortalHandler({
    id: false,
    open: () => { called.open = true; },
    update: (props: Record<string, any>) => { called.update = props; },
    close: () => { called.close = true; },
    remove: () => { called.remove = true; },
    isReady: () => {
      const p = portal.value as PortalHandler;

      Object.entries({ ...called }).forEach(([key, val]: [string, Record<string, any>]) => {
        setTimeout(() => (p as unknown as Record<string, Function>)[key](val), 16);
        delete called[key];
      });
    },
  });

  portal.value = handler;

  return portal.value as PortalHandler & { isReady: () => void };
}
