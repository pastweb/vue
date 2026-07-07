import { QUERY_CACHE_CONTEXT_KEY } from '@pastweb/tools/api/createQueryCache/constants';
import type { ApiCacheOptions, ApiCachePlugin } from './types';

/**
 * Creates a Vue plugin that provides a tools `QueryCache`.
 *
 * Install the returned plugin with `app.use(...)` so API composables can access
 * the shared cache through {@link useApiQueryCache}. The cache itself should be
 * created with `createQueryCache` from `@pastweb/tools`.
 *
 * @param options - API integration options.
 * @param options.queryCache - Query cache shared by API agents and Vue hooks.
 * @returns Vue plugin that provides the query cache under the tools context key.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { createQueryCache } from '@pastweb/tools';
 * import { installApiCache } from '@pastweb/vue';
 *
 * const queryCache = createQueryCache();
 *
 * createApp(App).use(installApiCache({ queryCache })).mount('#app');
 * ```
 */
export function installApiCache(options: ApiCacheOptions): ApiCachePlugin {
  const { queryCache } = options;

  return {
    install(app) {
      app.provide(QUERY_CACHE_CONTEXT_KEY, queryCache);
    },
  };
}
