import { shallowReactive, watchEffect } from 'vue';
import { update } from '@pastweb/tools/update';
import { DEFAULT_BOOLEAN_CHARS, OPTIONS } from './constants';
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
 * for that case: expose the prop as a string union such as `'true' | 'false'`, then let
 * this helper normalize those characters back to booleans after defaults are
 * applied. Normalization applies only to keys declared in `defaults`. It is
 * disabled by default; set `booleanChars` to `true` to use
 * `DEFAULT_BOOLEAN_CHARS`, or provide a marker tuple.
 *
 * A public Vue `class` prop is normalized to a default key named `className`
 * by default.
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
 *   defineProps<{ tone?: string; block?: 'true' | 'false' }>(),
 *   { tone: 'neutral', block: 'false' },
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
  const booleanChars = options?.booleanChars === true
    ? DEFAULT_BOOLEAN_CHARS
    : options?.booleanChars ?? OPTIONS.booleanChars;
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
          merged[key] = props[key];
        }
        return;
      }

      const value = opts.className && key === 'className'
        ? (props.class !== undefined ? props.class : props[key] !== undefined ? props[key] : defValue)
        : props[key] !== undefined ? props[key] : defValue;

      if (
        booleanChars !== false
        && typeof value === 'string'
        && (value === booleanChars[0] || value === booleanChars[1])
      ) {
        merged[key] = value === booleanChars[0];
        return;
      }

      merged[key] = value;
    });

    update(newProps, merged);
  });

  return newProps as T;
}
