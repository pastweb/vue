import { ROUTER_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
import type { ViewRouter } from '@pastweb/tools/createViewRouter/types';
import { getContext } from '../../getContext';

/**
 * Returns the active router navigation function.
 *
 * @returns The tools router `navigate` method.
 */
export function useNavigate(): ViewRouter['navigate'] {
  const router = getContext<ViewRouter>(ROUTER_CONTEXT_KEY);
  return router.navigate;
}
