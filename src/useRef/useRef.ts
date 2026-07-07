import { shallowRef, type Ref } from 'vue';

/**
 * Creates a Vue `shallowRef` with Pastweb's cross-framework ref naming.
 *
 * The returned value is a normal Vue ref, so consumers read and write through
 * `.value`. Because it is shallow, assigning a new value is reactive, while
 * nested object mutation is not deeply tracked by this helper.
 *
 * @param value - Optional initial ref value.
 * @returns Vue shallow ref containing the initial value.
 *
 * @example
 * ```ts
 * import { useRef } from '@pastweb/vue';
 *
 * const element = useRef<HTMLElement | null>(null);
 * element.value?.focus();
 * ```
 */
export function useRef<T>(value?: T): Ref<T | undefined> {
  return shallowRef(value);
}
