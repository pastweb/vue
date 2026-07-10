import { shallowReactive } from 'vue';
import { effect } from '@pastweb/tools/reactivity';
import { createRenderableState, getStoreSnapshot } from './utils';
import type {
  MicroStoreActions,
  ReuseMicroStoreResult,
  VueMicroStore,
  VueMicroStoreSelector,
} from './types';

/**
 * Reuses a tools `useMicroStore` function inside Vue rendering.
 *
 * `createMicroStore` from `@pastweb/tools` returns a framework-agnostic
 * `useMicroStore` function. `reuseMicroStore` receives that function, calls it
 * with the optional selector, and mirrors the selected readonly state into a
 * Vue-renderable object so templates update after store actions mutate tools
 * reactive state.
 *
 * @typeParam S - Micro-store state shape.
 * @typeParam A - Micro-store action shape.
 * @typeParam T - Selected state value when a selector is provided.
 * @param store - `useMicroStore` function returned by `createMicroStore` from `@pastweb/tools`.
 * @param selector - Optional selector passed to the tools `useMicroStore`.
 * @returns Full or selected micro-store state plus the original actions.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { createMicroStore } from '@pastweb/tools';
 * import { reuseMicroStore } from '@pastweb/vue';
 *
 * const settingsStore = createMicroStore('settings', () => ({
 *   state: {
 *     user: { name: 'Ada' },
 *   },
 *   actions: {
 *     rename(name: string) {
 *       this.state.user.name = name;
 *     },
 *   },
 * }));
 *
 * const settings = reuseMicroStore(settingsStore);
 * </script>
 *
 * <template>
 *   <button @click="settings.rename('Grace')">
 *     {{ settings.state.user.name }}
 *   </button>
 * </template>
 * ```
 */
export function reuseMicroStore<
  S extends Record<string, any>,
  A extends MicroStoreActions,
  T = never,
>(
  store: VueMicroStore<S, A>,
  selector?: VueMicroStoreSelector<T, S>,
): ReuseMicroStoreResult<S, A, T> {
  const initial = selector ? store(selector) : store();
  const output = shallowReactive({
    ...initial,
    state: createRenderableState(initial.state),
  }) as Record<string, any>;

  effect(
    () => {
      const next = selector ? store(selector) : store();

      Object.entries(next).forEach(([key, value]) => {
        output[key] = key === 'state' ? createRenderableState(value) : value;
      });
    },
    () => getStoreSnapshot(store, selector),
  );

  return output as ReuseMicroStoreResult<S, A, T>;
}
