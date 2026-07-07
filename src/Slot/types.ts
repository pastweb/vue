import type { VNode } from 'vue';

/**
 * Props accepted by {@link import('./Slot').Slot}.
 */
export interface SlotProps {
  /** Slot name to render. Defaults to the default slot. */
  name?: string;
  /** Additional props or listeners cloned onto rendered slot VNodes. */
  props?: Record<string, any>;
  /** Optional mapper that transforms the rendered slot content. */
  map?: (content: any) => VNode | VNode[];
};
