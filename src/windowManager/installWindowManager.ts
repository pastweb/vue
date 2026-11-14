import { WINDOW_MANAGER_CONTEXT_KEY } from '@pastweb/tools';
import type { Plugin } from 'vue';
import type { WindowManagerOptions } from './types';

/**
 * Creates a Vue plugin that provides an application window manager.
 *
 * @example
 * ```ts
 * app.use(installWindowManager({ manager }));
 * ```
 */
export function installWindowManager(options: WindowManagerOptions): Plugin {
  return {
    install(app) {
      app.provide(WINDOW_MANAGER_CONTEXT_KEY, options.manager);
    },
  };
}
