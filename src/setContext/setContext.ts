import { provide } from 'vue';

/**
 * Provides a value to descendants through Vue dependency injection.
 *
 * Use this helper instead of importing `provide` directly inside package
 * composables so context writes stay consistent across the Vue integration.
 * It must be called during component setup, or from a composable that runs
 * during setup.
 *
 * @typeParam T - Provided value type.
 * @param key - String key used by descendants with {@link getContext}.
 * @param value - Value to make available to descendant components.
 *
 * @example
 * ```ts
 * import { setContext } from '@pastweb/vue';
 *
 * setContext('session', { userId: 'user-1' });
 * ```
 */
export function setContext<T = undefined>(key: string, value: T): void {
  provide<T>(key, value);
}
