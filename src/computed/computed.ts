import { computed as vueComputed, type ComputedRef } from 'vue';

/**
 * Alias for Vue's native `computed` function.
 *
 * This helper exists so consumers can import `computed` from `@pastweb/vue`
 * alongside the rest of the package utilities while keeping the exact Vue
 * `ComputedRef` behavior.
 *
 * @typeParam T - Computed value type.
 * @param fn - Getter function passed directly to Vue `computed`.
 * @returns Vue `ComputedRef` returned by Vue `computed`.
 *
 * @example
 * ```ts
 * import { computed } from '@pastweb/vue';
 *
 * const fullName = computed(() => `${firstName.value} ${lastName.value}`);
 * ```
 */
export function computed<T = unknown>(fn: () => T): ComputedRef<T> {
  return vueComputed(fn);
}
