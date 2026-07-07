import { shallowReactive } from 'vue';
import { ROUTER_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
import type { Location, ViewRouter } from '@pastweb/tools/createViewRouter/types';
import { effect } from '@pastweb/tools/reactivity';
import { getContext } from '../../getContext';

/**
 * Returns a Vue reactive mirror of the router location.
 *
 * @returns Current tools router location.
 */
export function useLocation(): Location {
  const router = getContext<ViewRouter>(ROUTER_CONTEXT_KEY);
  const location = shallowReactive({ ...router.location }) as Location;

  effect(
    () => { Object.assign(location, router.location); },
    () => router.location,
    true,
  );

  return location;
}
