import { shallowReactive } from 'vue';
import { effect } from '@pastweb/tools/reactivity';
import { createRenderableState, getStoreSnapshot } from './utils';
import type {
  MicroStoreActions,
  ReuseMicroStoreHook,
  ReuseMicroStoreResult,
  VueMicroStore,
  VueMicroStoreSelector,
} from './types';

/**
 * Bridges a tools `useMicroStore` into Vue and returns a Vue composable for it.
 *
 * Define the bridge next to the tools store, export the composable, and call it
 * inside `setup` (optionally with a selector) so templates update when selected
 * tools reactive state changes.
 *
 * @typeParam S - Micro-store state shape.
 * @typeParam A - Micro-store action shape.
 * @param store - `useMicroStore` from `createMicroStore` in `@pastweb/tools`.
 * @returns A Vue composable: `useStore()` or `useStore(selector)`.
 *
 * @example
 * ```ts
 * // @/stores/settingsStore.ts
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
 * export const useSettingsStore = reuseMicroStore(settingsStore);
 * ```
 *
 * @example
 * ```vue
 * <!-- SettingsButton.vue -->
 * <script setup lang="ts">
 * import { useSettingsStore } from '@/stores/settingsStore';
 *
 * const settings = useSettingsStore();
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
>(store: VueMicroStore<S, A>): ReuseMicroStoreHook<S, A> {
  function useStore(): ReuseMicroStoreResult<S, A>;
  function useStore<T>(
    selector: VueMicroStoreSelector<T, S>,
  ): ReuseMicroStoreResult<S, A, T>;
  function useStore<T>(
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

  return useStore as ReuseMicroStoreHook<S, A>;
}
