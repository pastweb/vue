import { shallowRef } from 'vue';
import { effect } from '@pastweb/tools/reactivity';

/**
 * Reads enumerable fields from a tools reactive state object.
 *
 * Accessing each field while a tools `effect` is active registers those fields
 * as dependencies. This is useful when a custom bridge needs a snapshot of the
 * observed reactive values.
 *
 * @param target - Reactive state object returned by a tools API hook.
 * @returns Current values for the enumerable fields.
 */
export function readReactiveFields(target: Record<PropertyKey, any>): unknown[] {
  return Object.keys(target).map(key => target[key]);
}

/**
 * Bridges a tools reactive object into Vue rendering.
 *
 * The core API hooks from `@pastweb/tools` own the query and mutation state.
 * This helper observes their enumerable fields with the tools reactivity system
 * and exposes a proxy that also touches a Vue `shallowRef`, causing Vue
 * components to update when the tools state changes.
 *
 * @typeParam TState - Reactive state object shape.
 * @param createState - Factory that creates the tools reactive state.
 * @param getSnapshot - Optional custom dependency reader.
 * @returns The created reactive state object, proxied for Vue rendering.
 */
export function useReactiveRender<TState extends Record<PropertyKey, any>>(
  createState: () => TState,
  getSnapshot?: (state: TState) => unknown[],
): TState {
  const state = createState();
  const stateKeys = Object.keys(state);
  const renderTick = shallowRef(0);
  const readSnapshot = (target: TState) => {
    if (getSnapshot) return getSnapshot(target);

    return stateKeys.map(key => target[key]);
  };

  effect(() => {
    renderTick.value += 1;
  }, () => readSnapshot(state));

  return new Proxy(state, {
    get(target, key, receiver) {
      renderTick.value;

      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver);
    },
  });
}
