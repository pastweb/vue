import type { WindowManager } from '@pastweb/tools';

/** Options used to install an application window manager into Vue. */
export interface WindowManagerOptions {
  /** Application-owned manager shared by every managed portal. */
  manager: WindowManager;
}
