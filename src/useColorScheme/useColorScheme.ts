import { createMatchScheme } from '@pastweb/tools';
import { reuseColorScheme } from './reuseColorScheme';
import type { ColorSchemeInfo, SchemeOptions } from '@pastweb/tools';

/**
 * Vue composable for reading and updating the current color scheme.
 *
 * Creates an internal `MatchScheme` with `createMatchScheme` and subscribes to
 * mode and system changes. To bind an existing `MatchScheme`, use
 * {@link reuseColorScheme}.
 *
 * @param options - Options passed to `createMatchScheme`.
 * @returns A tuple with the current color scheme info and the mode setter.
 *
 * @example
 * ```ts
 * import { useColorScheme } from '@pastweb/vue';
 *
 * const [scheme, setMode] = useColorScheme({ defaultMode: 'auto' });
 *
 * setMode(scheme.selected === 'dark' ? 'light' : 'dark');
 * ```
 */
export function useColorScheme(options: SchemeOptions = {}): [ColorSchemeInfo, (mode: string) => void] {
  const useReusedColorScheme = reuseColorScheme(createMatchScheme(options));

  return useReusedColorScheme();
}
