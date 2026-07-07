import { shallowReactive, watchEffect } from 'vue';
import { update } from '@pastweb/tools/update';
import { OPTIONS } from './constants';
import type { WithDefaultPropsOptions } from './types';

/**
 * Merges Vue props with defaults and returns a reactive normalized object.
 *
 * Defaults are used only when the incoming prop value is `undefined`. Explicit
 * falsy values such as `false`, `0`, and `''` are preserved. The returned object
 * is updated whenever the source props change.
 *
 * Vue coerces absent Boolean props to `false` at runtime, which makes it
 * impossible for this helper to distinguish "not provided" from "explicitly
 * false" when a prop is declared as Boolean. The `booleanChars` option exists
 * for that case: expose the prop as a string union such as `'+' | '-'`, then let
 * this helper normalize those characters back to booleans after defaults are
 * applied. By default, `+` becomes `true` and `-` becomes `false`.
 *
 * A default key named `className` is also exposed as Vue's `class` prop by
 * default.
 *
 * @typeParam T - Resulting props type.
 * @param props - Source Vue props object.
 * @param defaults - Defaults applied when a prop is `undefined`.
 * @param options - Normalization options.
 * @returns Reactive props object containing source props plus defaults.
 *
 * @example
 * ```ts
 * const props = withDefaultProps(
 *   defineProps<{ tone?: string; block?: '+' | '-' }>(),
 *   { tone: 'neutral', block: '-' },
 * );
 * ```
 *
 * @example
 * ```ts
 * // With exclusions
 * const props = withDefaultProps(
 *   defineProps<...>(),
 *   { tone: 'neutral', internalFlag: true, debug: false },
 *   { exclude: ['debug', /^internal/] }
 * );
 * ```
 */
export function withDefaultProps<T>(props: Record<string, any>, defaults: Record<string, any>, options?: WithDefaultPropsOptions): T {
  const opts = { ...OPTIONS, ...options };
  const { booleanChars: [trueChar, falseChar] } = opts;
  const excludes = Array.isArray(opts.exclude) ? opts.exclude : [opts.exclude];
  const newProps = shallowReactive<Record<string, any>>({});

  const shouldExclude = (key: string): boolean => {
    if (!opts.exclude) return false;

    return excludes.some((rule) => {
      if (typeof rule === 'string') {
        return key === rule;
      }
      if (rule instanceof RegExp) {
        return rule.test(key);
      }
      return false;
    });
  };

  watchEffect(() => {
    const merged: Record<string, any> = { ...props };

    Object.entries(defaults).forEach(([key, defValue]) => {
      if (shouldExclude(key)) {
        // Still copy the original prop if it exists, but don't apply default
        if (props[key] !== undefined) {
          merged[opts.className && key === 'className' ? 'class' : key] = props[key];
        }
        return;
      }

      const value = props[key] !== undefined ? props[key] : defValue;

      // Boolean char normalization
      if (typeof value === 'string' && (value === trueChar || value === falseChar)) {
        merged[key] = value === trueChar ? true : value === falseChar ? false : defValue;
        return;
      }

      // className special handling
      const targetKey = opts.className && key === 'className' ? 'class' : key;
      merged[targetKey] = value;
    });

    update(newProps, merged);
  });

  return newProps as T;
}
