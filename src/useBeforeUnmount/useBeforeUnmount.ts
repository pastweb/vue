import { onBeforeUnmount } from 'vue';

/**
 * Registers a callback with Vue's `onBeforeUnmount` lifecycle hook.
 *
 * Use it for cleanup that should happen while the component instance is still
 * active, immediately before Vue unmounts it. Async callbacks are accepted for
 * parity with the package hook API, but Vue does not await the returned promise
 * before continuing unmount.
 *
 * @param fn - Callback invoked once before the component unmounts.
 *
 * @example
 * ```ts
 * import { useBeforeUnmount } from '@pastweb/vue';
 *
 * useBeforeUnmount(() => {
 *   subscription.remove();
 * });
 * ```
 */
export function useBeforeUnmount(fn: () => void | Promise<void>): void {
  onBeforeUnmount(fn);
}
