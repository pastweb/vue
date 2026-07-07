import type { App } from 'vue';
import type { QueryCache } from '@pastweb/tools';

/**
 * Options for {@link installApiCache}.
 */
export interface ApiCacheOptions {
  /** Query cache shared by API agents, Vue composables, and hydration-aware setup. */
  queryCache: QueryCache;
}

/**
 * Vue plugin returned by {@link installApiCache}.
 */
export interface ApiCachePlugin {
  /** Installs the query cache into the Vue app dependency injection tree. */
  install: (app: App) => void;
}
