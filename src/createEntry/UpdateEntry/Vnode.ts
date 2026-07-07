import { defineComponent, cloneVNode, type VNode } from 'vue';

/**
 * Props for the `Vnode` clone helper.
 */
type VnodeProps = {
  /** VNode to clone. */
  node: VNode;
  /** Props merged into the cloned VNode. */
  childProps: Record<string, any>;
}

/**
 * Clones and renders a provided Vue VNode with additional props.
 */
export const Vnode = defineComponent({
  props: ['node', 'childProps'],
  setup(props: VnodeProps) {
    return {
      vnode: cloneVNode(props.node, props.childProps || {}),
    };
    // return () => {
    //   return cloneVNode(props.node, props.childProps);
    // }
  },
  render() {
    // Return the provided vnode directly
    return this.vnode;
  }
});
