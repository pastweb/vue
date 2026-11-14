import type { Portal, PortalHandler, WindowManager } from '@pastweb/tools';

/** Props for the Vue {@link Portal} component. */
export interface PortalProps {
  /** Dot-separated path into the installed portal descriptor map. */
  path: string;

  /** Handler returned by {@link usePortal}. */
  use: PortalHandler & { isReady: () => void };

  /** Optional application window manager used to track this portal entry. */
  manager?: WindowManager;
}

/** Nested portal descriptor map. */
export interface Portals { [name: string]: Portal | Portals };
