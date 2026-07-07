import type { Component } from 'vue';

/** Props for the Vue `RouterView` component. */
export type RouterViewProps = {
  /** Named view to render from the selected route. Defaults to `default`. */
  name?: string;
};

/** Internal state used by `RouterView`. */
export type RouterViewState = {
  component: Component | null;
  props: Record<string, any>;
};
