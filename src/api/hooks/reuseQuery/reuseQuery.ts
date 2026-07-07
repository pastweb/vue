import { useReactiveRender } from '../utils';

/**
 * Reuses a tools reactive query-like state inside Vue rendering.
 *
 * `createState` is called when the composable runs. The returned tools
 * reactive object is wrapped by {@link useReactiveRender}, so Vue components
 * that read its fields update when those fields change.
 *
 * Use this helper to build custom Vue composables from the framework-agnostic
 * `@pastweb/tools` query primitives without reimplementing their state
 * machines.
 *
 * @typeParam TState - Reactive state object returned by a tools hook.
 * @param createState - Factory that creates the tools reactive state.
 * @returns The same state shape, bridged into Vue rendering.
 *
 * @example
 * ```ts
 * import { useQuery as createToolsQuery } from '@pastweb/tools';
 * import { reuseQuery } from '@pastweb/vue';
 *
 * export function useUsers(agent: Agent) {
 *   return reuseQuery(() => createToolsQuery({
 *     fn: () => agent.get('/api/users', { queryKey: ['users'] }),
 *   }));
 * }
 * ```
 */
export function reuseQuery<TState extends Record<PropertyKey, any>>(createState: () => TState): TState {
  return useReactiveRender(createState);
}

/**
 * Semantic alias for {@link reuseQuery} when the reused state represents a
 * mutation rather than a query.
 */
export const reuseMutation = reuseQuery;
