import { useQuery as createToolsQuery } from '@pastweb/tools/api/hooks/useQuery';
import { reuseQuery } from '../reuseQuery';
import type { QueryConfig, QueryInfo } from '@pastweb/tools/api/hooks/useQuery/types';

/**
 * Vue wrapper for `@pastweb/tools` `useQuery`.
 *
 * The underlying tools query state machine handles fetch status, retries,
 * caching, and invalidation. This composable returns that state in a shape Vue
 * components can read directly from setup functions and templates.
 *
 * @typeParam T - Query result data shape.
 * @param config - Query configuration passed to the tools hook.
 * @returns Reactive query information.
 *
 * @example
 * ```ts
 * const users = useQuery({
 *   fn: () => agent.get('/api/users', { queryKey: ['users'] }),
 * });
 * ```
 */
export function useQuery<T>(config: QueryConfig<T>): QueryInfo<T> {
  return reuseQuery(() => createToolsQuery(config));
}
