import { shallowReactive } from 'vue';
import { ROUTER_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
import { filterRoutes } from '@pastweb/tools/createViewRouter/utils/filterRoutes';
import type { FilterDescriptor, ViewRouter } from '@pastweb/tools/createViewRouter/types';
import { effect } from '@pastweb/tools/reactivity';
import { getContext } from '../../getContext';
import type { Route } from '../types';

/**
 * Returns router paths filtered by the tools `filterRoutes` helper.
 *
 * @param filter - Optional filter descriptor.
 * @returns Vue reactive route array.
 */
export function usePaths(filter: FilterDescriptor = {}): Route[] {
  const router = getContext<ViewRouter>(ROUTER_CONTEXT_KEY);
  const routes = shallowReactive(filterRoutes(router.paths, filter) as Route[]);

  effect(
    () => {
      const nextRoutes = filterRoutes(router.paths, filter) as Route[];
      routes.splice(0, routes.length, ...nextRoutes);
    },
    () => router.paths,
    true,
  );

  return routes;
}
