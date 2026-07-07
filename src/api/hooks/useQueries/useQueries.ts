import { useQueries as createToolsQueries } from '@pastweb/tools/api/hooks/useQueries';
import { reuseQuery } from '../reuseQuery';
import type { QueryConfig } from '@pastweb/tools/api/hooks/useQuery/types';
import type { UseQueriesInfo, UseQueriesInput } from '@pastweb/tools/api/hooks/useQueries/types';

/**
 * Vue wrapper for `@pastweb/tools` `useQueries`.
 *
 * Creates a tools aggregate query state for multiple query configs and bridges
 * the aggregate fields into Vue rendering.
 *
 * @typeParam T - Tuple of query configurations.
 * @param config - Aggregate query input passed to the tools hook.
 * @returns Reactive aggregate query information.
 *
 * @example
 * ```ts
 * const dashboard = useQueries({
 *   queries: [
 *     { fn: () => agent.get('/api/users', { queryKey: ['users'] }) },
 *     { fn: () => agent.get('/api/posts', { queryKey: ['posts'] }) },
 *   ],
 * });
 * ```
 */
export function useQueries<T extends readonly QueryConfig<any>[]>(config: UseQueriesInput<T>): UseQueriesInfo<T> {
  return reuseQuery(() => createToolsQueries(config));
}
