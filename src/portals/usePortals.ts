import { PORTALS_CONTEXT_KEY } from '@pastweb/tools/portals';
import { getContext } from '../getContext';

/**
 * Reads the installed portal descriptor map.
 *
 * The value is provided by {@link installPortals} under the shared
 * `PORTALS_CONTEXT_KEY` from `@pastweb/tools`.
 *
 * @typeParam T - Expected portal descriptor shape.
 * @returns The current portal descriptor map.
 */
export function usePortals<T>(): T {
  return getContext<T>(PORTALS_CONTEXT_KEY);
}
