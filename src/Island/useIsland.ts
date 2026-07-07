import { getContext } from '../getContext';
import { ISLAND_CONTEXT_KEY } from './constants';

/**
 * Returns whether the current component is rendered inside an {@link Island}.
 *
 * Entry adapters use this signal to hydrate nested entries only when they are
 * mounted as part of an island hydration boundary. The value is read from Vue
 * dependency injection using the shared `ISLAND_CONTEXT_KEY` from
 * `@pastweb/tools`.
 *
 * @returns `true` inside an `Island`, otherwise `false`.
 */
export function useIsland(): boolean {
  return Boolean(getContext<boolean | undefined>(ISLAND_CONTEXT_KEY));
}
