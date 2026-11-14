import { shallowReactive } from 'vue';
import { update } from '@pastweb/tools';
import { useBeforeUnmount } from '../useBeforeUnmount';
import type { ColorSchemeInfo, MatchScheme } from '@pastweb/tools';

/**
 * Creates a Vue composable bound to an existing tools `MatchScheme`.
 *
 * Use this when the scheme instance is created outside Vue and components
 * should subscribe to it. Each component using the returned composable receives
 * a reactive mirror and automatically removes its listeners on unmount.
 *
 * @param matchScheme - Pre-created `MatchScheme` instance.
 * @returns A Vue composable that returns the current scheme info and mode setter.
 *
 * @example
 * ```ts
 * import { createMatchScheme } from '@pastweb/tools';
 * import { reuseColorScheme } from '@pastweb/vue';
 *
 * const matchScheme = createMatchScheme({ defaultMode: 'auto' });
 * export const useColorScheme = reuseColorScheme(matchScheme);
 * ```
 */
export function reuseColorScheme(matchScheme: MatchScheme): () => [ColorSchemeInfo, (mode: string) => void] {
  return function useReusedColorScheme(): [ColorSchemeInfo, (mode: string) => void] {
    const current = shallowReactive(matchScheme.getInfo()) as ColorSchemeInfo;
    const updateCurrent = () => update(current, matchScheme.getInfo());
    const modeListener = matchScheme.onModeChange(updateCurrent);
    const systemListener = matchScheme.onSysSchemeChange(updateCurrent);

    updateCurrent();

    useBeforeUnmount(() => {
      modeListener.removeListener();
      systemListener.removeListener();
    });

    return [current, matchScheme.setMode];
  };
}
