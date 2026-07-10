import { createMicroStore as createToolsMicroStore } from '@pastweb/tools/createMicroStore';
import { reuseMicroStore } from './reuseMicroStore';
import type {
  MicroStoreActions,
  Selector,
  VueMicroStoreSelector,
} from './reuseMicroStore';
import type { MicroStoreConfig, VueUseMicroStore } from './types';

/**
 * Creates a tools micro-store and returns a Vue-ready composable for it.
 *
 * The parameters match `createMicroStore` from `@pastweb/tools`. The returned
 * composable uses {@link reuseMicroStore} internally, so Vue components update
 * when the selected micro-store state changes.
 *
 * @typeParam S - Micro-store state shape.
 * @typeParam A - Micro-store action shape.
 * @param name - Unique store name.
 * @param setup - Tools micro-store setup function.
 * @returns Vue composable for reading the micro-store.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { createMicroStore } from '@pastweb/vue';
 *
 * const useCounterStore = createMicroStore('counter', () => ({
 *   state: { count: 0 },
 *   actions: {
 *     increment() {
 *       this.state.count += 1;
 *     },
 *   },
 * }));
 *
 * const counter = useCounterStore(state => state.count);
 * </script>
 *
 * <template>
 *   <button @click="counter.increment">
 *     {{ counter.state }}
 *   </button>
 * </template>
 * ```
 */
export function createMicroStore<S extends Record<string, any>, A extends MicroStoreActions>(
  name: string,
  setup: (select: <T>(fn: Selector<T, S>) => T) => MicroStoreConfig<S, A>,
): VueUseMicroStore<S, A> {
  const store = createToolsMicroStore(name, setup);

  function useVueMicroStore<T>(selector?: VueMicroStoreSelector<T, S>) {
    return selector ? reuseMicroStore(store, selector) : reuseMicroStore(store);
  }

  return useVueMicroStore as VueUseMicroStore<S, A>;
}
