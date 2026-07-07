import { onMounted } from 'vue';

/**
 * Registers a callback with Vue's `onMounted` lifecycle hook.
 *
 * Use it for work that requires the component to be mounted, such as reading
 * DOM refs, installing browser-only listeners, or starting client-side effects.
 * Async callbacks are accepted, but Vue does not use the returned promise as a
 * cleanup function.
 *
 * @param fn - Callback invoked once after the component mounts.
 *
 * @example
 * ```ts
 * import { useMounted } from '@pastweb/vue';
 *
 * useMounted(() => {
 *   inputRef.value?.focus();
 * });
 * ```
 */
export function useMounted(fn: () => void | Promise<void>): void {
  onMounted(fn);
}
