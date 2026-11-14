import { WINDOW_MANAGER_CONTEXT_KEY } from '@pastweb/tools';
import { getContext } from '../getContext';
import type { WindowManager } from '@pastweb/tools';

/**
 * Reads the application window manager from Vue dependency injection.
 *
 * @returns The installed window manager, or `undefined` when absent.
 *
 * @example
 * ```ts
 * const manager = useWindowManager();
 * ```
 */
export function useWindowManager(): WindowManager | undefined {
  return getContext<WindowManager | undefined>(WINDOW_MANAGER_CONTEXT_KEY);
}
