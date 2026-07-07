import { inject } from 'vue';

/**
 * Reads a value from the active Vue dependency-injection context.
 *
 * Use this helper instead of importing `inject` directly inside package
 * composables so context access stays consistent across the Vue integration.
 * It must be called during component setup, or from a composable that runs
 * during setup.
 *
 * @typeParam T - Expected value type for the provided context value.
 * @param key - String key used when the value was provided with {@link setContext}.
 * @returns The injected value cast to `T`, or `undefined` when no provider exists.
 *
 * @example
 * ```ts
 * import { getContext } from '@pastweb/vue';
 *
 * const session = getContext<{ userId: string }>('session');
 * ```
 */
export function getContext<T = any>(key: string): T {
  return inject(key, undefined) as T;
}
