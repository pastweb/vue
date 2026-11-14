import { createMicroStore as createToolsMicroStore } from '@pastweb/tools/createMicroStore';
import { reuseMicroStore } from './reuseMicroStore';
import type { MicroStoreActions, Selector } from './reuseMicroStore';
import type { MicroStoreConfig, VueUseMicroStore } from './types';

/**
 * Creates a tools micro-store and returns a Vue-ready composable for it.
 *
 * The parameters match `createMicroStore` from `@pastweb/tools`. The returned
 * composable is produced by {@link reuseMicroStore}, so Vue components update
 * when the selected micro-store state changes.
 *
 * Define the store in a module, export the composable, and import it in components.
 *
 * @typeParam S - Micro-store state shape.
 * @typeParam A - Micro-store action shape.
 * @param name - Unique store name.
 * @param setup - Tools micro-store setup function.
 * @returns Vue composable for reading the micro-store.
 *
 * @example
 * ```ts
 * // @/stores/counterStore.ts
 * import { createMicroStore } from '@pastweb/vue';
 *
 * export const useCounterStore = createMicroStore('counter', () => ({
 *   state: { count: 0 },
 *   actions: {
 *     increment() {
 *       this.state.count += 1;
 *     },
 *   },
 * }));
 * ```
 *
 * @example
 * ```vue
 * <!-- Counter.vue -->
 * <script setup lang="ts">
 * import { useCounterStore } from '@/stores/counterStore';
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
  return reuseMicroStore(createToolsMicroStore(name, setup));
}
