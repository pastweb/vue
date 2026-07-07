import { getCurrentInstance, watchEffect, shallowRef, type VNode } from 'vue';

/**
 * Reads the current component's default slot children as Vue VNodes.
 *
 * This helper is intended for render-function utilities that need to inspect or
 * forward default slot content from the active component instance. When no
 * component instance or default slot is available, it returns an empty array.
 *
 * @returns Default slot children for the current component instance.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { useChildren } from '@pastweb/vue';
 *
 * const children = useChildren();
 *
 * return () => h('div', children);
 * ```
 */
export function useChildren(): VNode[] {
  const instance = getCurrentInstance();
  const children = shallowRef<VNode[]>([]);

  watchEffect(() => {
    if (!instance?.vnode || !instance?.vnode.children) return;
    children.value = (instance?.vnode.children as any).default() as VNode[];
  });

  return children.value as unknown as VNode[];
}
