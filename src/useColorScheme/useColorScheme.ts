import { shallowReactive } from 'vue';
import { createMatchScheme } from '@pastweb/tools/createMatchScheme';
import { update } from '@pastweb/tools/update';
import { useBeforeUnmount } from '../useBeforeUnmount';
import type { RemoveListener } from '@pastweb/tools/createEventEmitter/types';
import type { MatchScheme, ColorSchemeInfo, SchemeOptions } from '@pastweb/tools/createMatchScheme/types';

/**
 * Vue composable for reading and updating the current color scheme.
 *
 * The signature mirrors `useColorScheme` from `@pastweb/tools` and the React
 * package: pass options to create an internal `MatchScheme`, or pass a
 * pre-created `matchScheme` as the second argument. The Vue wrapper subscribes
 * to mode/system changes and cleans those listeners up before component
 * unmount.
 *
 * @param options - Options passed to `createMatchScheme` when `matchScheme` is not provided.
 * @param matchScheme - Optional pre-created `MatchScheme` instance.
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
export function useColorScheme(options: SchemeOptions = {}, matchScheme?: MatchScheme): [ColorSchemeInfo, (mode: string) => void] {
  const scheme = matchScheme ?? createMatchScheme(options);
  const current = shallowReactive(scheme.getInfo()) as ColorSchemeInfo;

  const updateCurrent = () => update(current, scheme.getInfo());

  const onModeChange: RemoveListener = scheme.onModeChange(updateCurrent);
  const onSysChange: RemoveListener = scheme.onSysSchemeChange(updateCurrent);

  updateCurrent();

  useBeforeUnmount(() => {
    onModeChange.removeListener();
    onSysChange.removeListener();
  });

  return [current, scheme.setMode];
}
