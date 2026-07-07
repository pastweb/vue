import type { VueEntryNormalizedOptions, VueEntryOptions } from '../../types';

/**
 * Normalizes optional Vue entry configuration.
 *
 * Converts plugin usage and component/directive registration into stable array
 * and object shapes so entry setup can apply them without branching on every
 * call site.
 *
 * @param options - User-provided Vue entry options.
 * @returns Vue entry options with normalized `use` and `register` fields.
 */
export function normalizeVueOptions(options: VueEntryOptions = {}): VueEntryNormalizedOptions {
  const use = !options.use ? [] : Array.isArray(options.use) ? options.use : [ options.use ];

  const register = {
    component: options.register && options.register.component || {},
    directive: options.register && options.register.directive || {},
  };

  return {
    ...options,
    use,
    register,
  };
}
