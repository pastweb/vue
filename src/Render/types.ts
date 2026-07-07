import type { Component, VNode } from 'vue';

/**
 * Content accepted by the {@link Render} component.
 *
 * Primitive strings and numbers are rendered as text. Vue VNodes are cloned so
 * extra props can be merged onto them. Component definitions are rendered with
 * the provided props.
 */
export type Content = string | number | VNode | Component;

/** Props for the Vue {@link Render} component. */
export interface RenderProps {
  /** Primitive content, a Vue VNode, or a Vue component definition to render. */
  content: Content;

  /** Additional props passed to a component or merged into a cloned VNode. */
  props?: Record<string, any>;
}
