import { QUERY_CACHE_CONTEXT_KEY } from '@pastweb/tools/api/createQueryCache/constants';
import type { QueryCache } from '@pastweb/tools/api/createQueryCache/types';
import { getContext } from '../../../getContext';

/**
 * Returns the active tools `QueryCache` from Vue dependency injection.
 *
 * The cache is provided by installing the plugin returned from
 * {@link installApiCache}. This keeps cache ownership in `@pastweb/tools`
 * while exposing Vue-friendly access for composables and components.
 *
 * @returns The active tools `QueryCache`.
 * @throws When no query cache has been provided in the current app tree.
 *
 * @example
 * ```ts
 * import { useApiQueryCache } from '@pastweb/vue';
 *
 * const queryCache = useApiQueryCache();
 * ```
 */
export function useApiQueryCache(): QueryCache {
  const queryCache = getContext<QueryCache | undefined>(QUERY_CACHE_CONTEXT_KEY);

  if (!queryCache) {
    throw new Error(
      'useApiQueryCache error: queryCache must be installed via installApiCache.'
    );
  }

  return queryCache;
}
