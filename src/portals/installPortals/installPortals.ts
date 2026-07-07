import { currentIdCache } from '@pastweb/tools/createIdCache';
import { anchorsSetup, currentPortalsCache, PORTALS_CONTEXT_KEY, PORTAL_ANCHORS_CONTEXT_KEY } from '@pastweb/tools/portals';
import type { App } from 'vue';
import type{ PortalsOptions } from './types';

/**
 * Creates a Vue plugin that installs portal descriptors and anchor ids.
 *
 * The descriptors are created by `anchorsSetup` from `@pastweb/tools` and are
 * provided under the shared tools context keys. Components can then read them
 * with {@link usePortals} and {@link usePortalAnchors}.
 *
 * @param options - Portal installation options.
 * @returns Vue plugin that provides portal descriptors and anchor ids.
 */
export function installPortals({
  anchorsIds,
  getEntry,
  idChahe = currentIdCache,
  portalsCache = currentPortalsCache,
}: PortalsOptions) {
  return {
    install(app: App) {
      const portals = anchorsSetup(getEntry, anchorsIds, idChahe, portalsCache);

      app.provide(PORTALS_CONTEXT_KEY, portals as typeof portals);
      app.provide(PORTAL_ANCHORS_CONTEXT_KEY, anchorsIds);
    }
  };
}
