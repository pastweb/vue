import type { Component, VNode } from 'vue';
import type { IdCache } from '@pastweb/tools/createIdCache';
import type { PortalAnchorsIds, Portals } from '@pastweb/tools/portals';
import type { VueEntry } from '../../createEntry';

/**
 * Options used to install Vue portal descriptors into app-level dependency
 * injection.
 */
export interface PortalsOptions {
  /** Anchor ids keyed by portal path. */
  anchorsIds: PortalAnchorsIds;

  /** Factory that creates a Vue entry for each opened portal. */
  getEntry: (props: Record<string, any>, component: Component | VNode | null) => VueEntry,

  /** Optional id cache used by the tools portal layer. */
  idChahe?: IdCache;

  /** Optional portal cache used by the tools portal layer. */
  portalsCache?: Portals;
}
