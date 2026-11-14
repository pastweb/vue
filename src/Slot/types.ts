import type { VNode } from 'vue';

/**
 * Props accepted by {@link import('./Slot').Slot}.
 */
export interface SlotProps {
  /** Name of the owning component's slot to render. Defaults to the default slot. */
  name?: string;
  /**
   * Scoped values passed to the selected slot. When `map` is omitted, these are
   * also cloned onto rendered VNodes as props/listeners.
   */
  props?: Record<string, any>;
  /** Optional mapper that transforms each rendered slot VNode with its index. */
  map?: (content: VNode, index: number) => VNode | VNode[];
};
