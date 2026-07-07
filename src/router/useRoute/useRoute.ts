import { shallowReactive } from 'vue';
import { ROUTE_DEPTH_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
import { routeDive } from '@pastweb/tools/createViewRouter/utils/routeDive';
import type { SelectedRoute } from '@pastweb/tools/createViewRouter/types';
import { effect } from '@pastweb/tools/reactivity';
import { getContext } from '../../getContext';
import { useRouter } from '../useRouter';

/**
 * Returns the selected route for the current `RouterView` depth.
 *
 * @returns Vue reactive mirror of the selected tools route.
 */
export function useRoute(): SelectedRoute {
  const router = useRouter();
  const depth = getContext<number>(ROUTE_DEPTH_CONTEXT_KEY);
  const route = shallowReactive(routeDive(router.currentRoute, depth));

  effect(
    () => { Object.assign(route, routeDive(router.currentRoute, depth)); },
    () => router.currentRoute,
    true,
  );

  return route;
}
