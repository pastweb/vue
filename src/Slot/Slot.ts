import { cloneVNode, defineComponent, getCurrentInstance } from 'vue';
import type { SlotProps } from './types';

/**
 * A flexible VNode wrapper for transforming a component's named slot content.
 * It resolves the named slot from its owning component first, then falls back
 * to a slot declared on itself and finally its default content. `props` provide
 * scoped values and, without `map`, clone attributes onto the rendered VNodes.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { h } from 'vue';
 * import { Slot } from '@pastweb/vue';
 * </script>
 *
 * <template>
 *   <Slot name="header" :props="{ title: 'Settings', class: 'header' }">
 *     <h1>Default header</h1>
 *   </Slot>
 *
 *   <Slot
 *     :map="(content, index) => h('div', { class: `wrapper wrapper-${index}` }, content)"
 *   />
 *
 *   <!-- Used when the owning component does not provide #fallback. -->
 *   <Slot name="fallback">
 *     <template #fallback>Fallback content</template>
 *   </Slot>
 * ```
 */
export default defineComponent<SlotProps>({
  props: {
    /**
     * The name of the slot to render. Defaults to 'default'.
     * @type {string}
     * @default 'default'
     * @example 'header' // Renders the #header slot
     */
    name: {
      type: String,
      default: 'default'
    },
    /**
     * Values passed to a scoped slot. When `map` is omitted, they are also merged
     * into the slot's VNode(s) via cloning. If the slot content is an array of
     * VNodes, each will be cloned individually.
     * @type {Record<string, any>}
     * @example { class: 'bg-red-500', style: 'font-weight: bold' }
     */
    props: {
      type: Object,
      required: false
    },
    /**
     * An optional mapping function to transform the slot content.
     * Receives each slot VNode and its index, and must return a VNode or array.
     * Replaces VNode cloning, while `props` remain available to a scoped slot.
     * @type {(content: VNode, index: number) => VNode | VNode[]}
     * @example (content, index) => h('div', { class: `container container-${index}` }, content)
     */
    map: {
      type: Function,
      required: false
    }
  },
  setup(props, { slots }) {
    const ownerSlots = getCurrentInstance()?.parent?.slots;

    const renderSlot = () => {
      const targetSlotName = props.name ?? 'default';
      const content = ownerSlots?.[targetSlotName]?.(props.props)
        ?? slots[targetSlotName]?.(props.props)
        ?? slots.default?.(props.props)
        ?? [];

      if (content.length === 0) return null;

      if (props.map) {
        return content.flatMap((vnode, index) => props.map!(vnode, index));
      }

      if (props.props) {
        return content.map((vnode) => cloneVNode(vnode, props.props));
      }

      return content;
    };

    return renderSlot;
  }
});
