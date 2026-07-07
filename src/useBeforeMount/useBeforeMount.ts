import { onBeforeMount } from 'vue';

/**
 * Registers a callback with Vue's `onBeforeMount` lifecycle hook.
 *
 * Use it for setup that must run after `setup()` has finished but before the
 * component is mounted into the DOM. Async callbacks are accepted for parity
 * with the package hook API, but Vue does not await the returned promise before
 * continuing the mount.
 *
 * @param fn - Callback invoked once before the component mounts.
 *
 * @example
 * ```ts
 * import { useBeforeMount } from '@pastweb/vue';
 *
 * useBeforeMount(() => {
 *   registry.register('profile-card');
 * });
 * ```
 */
export function useBeforeMount(fn: () => void | Promise<void>): void {
  onBeforeMount(fn);
}
