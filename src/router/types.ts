import type { Component } from 'vue';
import {
  type RouterOptions,
  type ViewRouter,
  type Route as _route,
} from '@pastweb/tools/createViewRouter/types';

/** Vue component type accepted by route view definitions. */
export type ViewComponent = Component | (() => Promise<Component>);

/** Optional route authorization callback shape for Vue route metadata. */
export type AuthFunction = (router: ViewRouter) => any | Promise<any>;

/** Vue route definition extending the tools route with Vue component views. */
export interface Route extends Omit<_route, 'view' | 'views' | 'children'> {
  authenticated?: boolean | AuthFunction;
  children?: Route[];
  icon?: string;
  label?: string;
  props?: Record<string, any>;
  view?: ViewComponent;
  views?: Record<string, ViewComponent>;
};

export type { RouterOptions, ViewRouter };
