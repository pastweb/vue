import { createAsyncStore } from '@pastweb/tools/createAsyncStore';
import { noop } from '@pastweb/tools/noop';
import { createPinia } from 'pinia';
import type { PiniaAsyncStore, PiniaStoreOptions } from './types';

/**
 * Creates an async Pinia store wrapper.
 *
 * The returned object is a tools async store with a Pinia instance attached as
 * `store`. Calling `init()` runs the optional `onInit` callback with that Pinia
 * instance and marks the async store as ready when the callback resolves.
 *
 * @param options - Async Pinia store options.
 * @param options.name - Optional name suffix used for the underlying async store.
 * @param options.onInit - Optional initialization callback that receives the Pinia instance.
 * @returns Async store with a Pinia instance attached.
 *
 * @example
 * ```ts
 * import { createPiniaAsyncStore } from '@pastweb/vue/createPiniaAsyncStore';
 *
 * const piniaStore = createPiniaAsyncStore({
 *   name: 'app',
 *   async onInit(pinia) {
 *     app.use(pinia);
 *   },
 * });
 *
 * await piniaStore.init();
 * ```
 */
export function createPiniaAsyncStore(options: PiniaStoreOptions): PiniaAsyncStore {
  const asyncStore = createAsyncStore<PiniaAsyncStore>({
    ...options,
    name: `PiniaAsyncStore${options.name ? `:${options.name}` : ''}`,
  });

  const store = createPinia();

  asyncStore.store = store;

  asyncStore.init = async () => {
    const { onInit = noop } = asyncStore.options as PiniaStoreOptions;
    await onInit(store);
    asyncStore.setStoreReady();
  };

  return asyncStore;
}
