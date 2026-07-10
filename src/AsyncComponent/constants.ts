import type { ComponentModule } from './types';

/**
 * Server-side cache for components loaded through the SSR async task queue.
 *
 * @example
 * ```ts
 * const Loaded = PRELOADED_ON_SERVER.get(componentLoader);
 * ```
 */
export const PRELOADED_ON_SERVER = new WeakMap<() => Promise<any>, ComponentModule['default']>();
