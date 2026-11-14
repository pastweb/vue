import {
  setAsInfiniteQuery,
  useInfiniteQuery as createToolsInfiniteQuery,
} from '@pastweb/tools/api/hooks/useInfiniteQuery';
import { reuseQuery } from '../reuseQuery';
import type {
  InfiniteQueryConfig,
  InfiniteQueryInfo,
} from '@pastweb/tools/api/hooks/useInfiniteQuery/types';

/**
 * Vue wrapper for `@pastweb/tools` `useInfiniteQuery`.
 *
 * The core infinite query owns page ordering, fetch status, retry behavior, and
 * cache interaction. This composable bridges that reactive state into Vue
 * rendering so templates update when query fields change.
 *
 * @typeParam TPage - Data shape for each fetched page.
 * @typeParam TPageParam - Page parameter shape.
 * @param config - Infinite query configuration passed to the tools hook.
 * @returns Reactive infinite query information.
 *
 * @example
 * ```ts
 * const posts = useInfiniteQuery({
 *   initialPageParam: 1,
 *   fn: page => agent.get(`/api/posts?page=${page}`, {
 *     queryKey: ['posts', page],
 *   }),
 * });
 * ```
 */
export function useInfiniteQuery<TPage, TPageParam = unknown>(
  config: InfiniteQueryConfig<TPage, TPageParam>,
): InfiniteQueryInfo<TPage, TPageParam> {
  const query = reuseQuery(() => createToolsInfiniteQuery(config));
  setAsInfiniteQuery(query);

  return query;
}
