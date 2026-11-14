import { ROUTER_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
import type { ViewRouter } from '@pastweb/tools/createViewRouter/types';
import { getContext } from '../../getContext';

/**
 * Returns the active tools `ViewRouter` from Vue dependency injection.
 *
 * @returns Router installed by `installRouter`.
 */
export function useRouter(): ViewRouter {
  return getContext<ViewRouter>(ROUTER_CONTEXT_KEY);
}
