import type { Portal, PortalHandler } from '@pastweb/tools/portals';

/** Props for the Vue {@link Portal} component. */
export interface PortalProps {
  /** Dot-separated path into the installed portal descriptor map. */
  path: string;

  /** Handler returned by {@link usePortal}. */
  use: PortalHandler & { isReady: () => void };
}

/** Nested portal descriptor map. */
export interface Portals { [name: string]: Portal | Portals };
