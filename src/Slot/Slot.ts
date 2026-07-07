import { defineComponent, isVNode, cloneVNode, type VNode } from 'vue';
import type { SlotProps } from './types';

/**
 * A flexible slot wrapper component that allows rendering a named or default slot
 * with optional transformations. It can apply additional props to the slot content
 * via cloning, or transform the content using a custom mapping function.
 *
 * @example
 * ```vue
 * <template>
 *   <Slot name="header" :props="{ class: 'bg-blue-500 text-white p-4' }">
 *     <template #header>
 *       <h1>My Custom Header</h1>
 *     </template>
 *   </Slot>
 *
 *   <!-- With a mapping function to wrap content in a div -->
 *   <Slot :map="(content) => h('div', { class: 'wrapper' }, content)">
 *     <template #default>
 *       <p>Default content wrapped in a div.</p>
 *     </template>
 *   </Slot>
 * </template>
 *
 * <script setup lang="ts">
 * import { h } from 'vue';
 * import SlotWrapper from './SlotWrapper.vue';
 * </script>
 * ```
 *
 * In the example above:
 * - The first `Slot` renders the `header` slot and applies CSS classes via `props`.
 * - The second uses `map` to wrap the default slot content in a `div` with a class.
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
      required: false
    },
    /**
     * An object of additional props to merge into the slot's VNode(s) via cloning.
     * If the slot content is an array of VNodes, each will be cloned individually.
     * Ignored if `map` is provided.
     * @type {Record<string, any>}
     * @example { class: 'bg-red-500', style: 'font-weight: bold' }
     */
    props: {
      type: Object,
      required: false
    },
    /**
     * An optional mapping function to transform the slot content.
     * Receives the slot content (single VNode or array) and must return a VNode or array.
     * Takes precedence over `props`.
     * @type {(content: VNode | VNode[]) => VNode | VNode[]}
     * @example (content) => h('div', { class: 'container' }, content)
     */
    map: {
      type: Function,
      required: false
    }
  },
  setup(props, { slots }) {
    const renderSlot = () => {
      const targetSlotName = props.name || 'default';
      const targetContent = slots[targetSlotName as string]?.() || [] as VNode[];

      if (targetContent.length === 0) return slots.default?.() || null;

      let content: VNode | VNode[] = targetContent.length === 1 ? targetContent[0] : targetContent;

      if (props.map) {
        const mapped = props.map(content);
        // Normalize to array for consistency, but render accepts single VNode too
        return Array.isArray(mapped) ? mapped : (mapped as VNode);
      }

      if (props.props) {
        if (isVNode(content)) {
          return cloneVNode(content, props.props);
        } else {
          return (content as VNode[]).map((vnode) => cloneVNode(vnode, props.props));
        }
      }

      return content;
    };

    return renderSlot;
  }
});
