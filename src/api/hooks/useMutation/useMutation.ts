import { useMutation as createToolsMutation } from '@pastweb/tools/api/hooks/useMutation';
import { reuseMutation } from '../reuseQuery';
import type { MutationConfig, MutationInfo } from '@pastweb/tools/api/hooks/useMutation/types';

/**
 * Vue wrapper for `@pastweb/tools` `useMutation`.
 *
 * The mutation object is created by tools and bridged into Vue rendering. Use it
 * for POST/PUT/PATCH/DELETE style actions, cache invalidation callbacks, and
 * mutation lifecycle state.
 *
 * @typeParam T - Mutation result data shape.
 * @param config - Mutation configuration passed to the tools hook.
 * @returns Reactive mutation information.
 *
 * @example
 * ```ts
 * const saveUser = useMutation({
 *   fn: payload => agent.post('/api/users', payload),
 * });
 * ```
 */
export function useMutation<T>(config: MutationConfig<T>): MutationInfo<T> {
  return reuseMutation(() => createToolsMutation(config));
}
