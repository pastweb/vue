import { shallowReactive, type Plugin } from 'vue';
import { ROUTE_DEPTH_CONTEXT_KEY, ROUTER_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
import type { ViewRouter } from '@pastweb/tools/createViewRouter/types';
import { effect } from '@pastweb/tools/reactivity';
import { RouterView } from './RouterView';
import { RouterLink } from './RouterLink';

/**
 * Creates a Vue plugin that installs a tools `ViewRouter`.
 *
 * @param router - Router created by `createViewRouter` from `@pastweb/tools`.
 * @returns Vue plugin that provides router context and registers router components.
 */
export function installRouter(router: ViewRouter): Plugin {
  return {
    install(app) {
      const route = shallowReactive(router.currentRoute);

      app.config.globalProperties.$$router = router;
      app.config.globalProperties.$$route = route;

      effect(
        () => { Object.assign(route, router.currentRoute); },
        () => router.currentRoute,
        true,
      );

      app.provide(ROUTER_CONTEXT_KEY, router);
      app.provide('$$route', app.config.globalProperties.$$route);
      app.provide(ROUTE_DEPTH_CONTEXT_KEY, -1);

      app.component('RouterView', RouterView);
      app.component('RouterLink', RouterLink);
    },
  };
}
