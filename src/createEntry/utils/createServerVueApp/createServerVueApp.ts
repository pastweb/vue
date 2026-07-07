import { setupVueEntry } from '../setupVueEntry';
import type { App } from 'vue';
import type { Entry } from '@pastweb/tools';
import type { VueEntryNormalizedOptions } from '../../types';
import type { CreateServerApp } from './types';

/**
 * Creates the Vue app used by {@link createServerEntry}.
 *
 * This server-specific builder intentionally renders the entry component
 * directly. It does not use the browser-only `WaitFor` or `UpdateEntry`
 * components; async dependencies are awaited by `createServerEntry` before the
 * app is rendered, and fallback rendering is selected here only when that wait
 * step fails.
 *
 * @param entry - Normalized tools entry used to build the Vue SSR app.
 * @param createSSRApp - Vue `createSSRApp` function.
 * @param options - Server render options.
 * @param options.useFallback - Render the configured fallback component instead of the entry component.
 * @returns Configured Vue SSR app instance.
 */
export function createServerVueApp(
  entry: Entry<VueEntryNormalizedOptions>,
  createSSRApp: CreateServerApp,
  options: { useFallback?: boolean } = {},
): App {
  const { fallback, initData = {} } = entry.options;
  const rootComponent = options.useFallback && fallback ? fallback : entry.EntryComponent;
  const rootProps = options.useFallback && fallback ? {} : initData;
  const app = createSSRApp(rootComponent, rootProps);

  setupVueEntry(app, entry.options);

  return app;
}
