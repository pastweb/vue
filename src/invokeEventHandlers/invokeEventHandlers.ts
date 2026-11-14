/**
 * Invokes one Vue event callback or every callback in Vue's merged listener
 * array.
 *
 * Vue may merge a callback prop such as `onChange` and an `@change` listener
 * into an array. This helper keeps extension bridges compatible with both
 * representations without passing that array to framework-neutral renderers.
 *
 * @param handlers - A callback, Vue's merged callback array, or no callback.
 * @param args - Arguments forwarded to every callable handler.
 *
 * @example
 * ```ts
 * import { invokeEventHandlers } from '@pastweb/vue';
 *
 * invokeEventHandlers(props.onChange, value);
 * ```
 */
export function invokeEventHandlers(
  handlers: unknown,
  ...args: unknown[]
): void {
  (Array.isArray(handlers) ? handlers : [handlers]).forEach(handler => {
    if (typeof handler === 'function') handler(...args);
  });
}
