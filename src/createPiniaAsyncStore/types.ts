import type { AsyncStore, AsyncStoreOptions } from '@pastweb/tools';
import type { Pinia } from 'pinia';

/**
 * Options accepted by {@link createPiniaAsyncStore}.
 */
export interface PiniaStoreOptions {
  /** Optional name suffix appended to the underlying async store name. */
  name?: string;
  /** Callback executed by `init` with the created Pinia instance. */
  onInit?: (pinia: Pinia) => Promise<void> | void;
};

/**
 * Tools async store enhanced with a Pinia instance.
 */
export type PiniaAsyncStore = AsyncStore<AsyncStoreOptions & PiniaStoreOptions> & {
  /** Pinia instance created by `createPinia`. */
  store: Pinia;
};
