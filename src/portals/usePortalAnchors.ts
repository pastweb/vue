import { PORTAL_ANCHORS_CONTEXT_KEY } from '@pastweb/tools/portals';
import { getContext } from '../getContext';

/**
 * Reads the installed portal anchor ids.
 *
 * The value is provided by {@link installPortals} under the shared
 * `PORTAL_ANCHORS_CONTEXT_KEY` from `@pastweb/tools`.
 *
 * @typeParam T - Expected anchor id map shape.
 * @returns The current portal anchor ids.
 */
export function usePortalAnchors<T>(): T {
  return getContext<T>(PORTAL_ANCHORS_CONTEXT_KEY);
}
