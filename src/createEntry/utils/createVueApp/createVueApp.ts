import { UpdateEntry } from '../../UpdateEntry';
import { WaitFor } from '../../WaitFor';
import { setupVueEntry } from '../setupVueEntry';
import type { App, Component } from 'vue';
import type { VueEntryNormalizedOptions } from '../../types';
import type { Entry } from '@pastweb/tools';

type CreateVueApp = (rootComponent: Component, rootProps?: Record<string, any>) => App;

/**
 * Creates the browser-side Vue app used by {@link createEntry}.
 *
 * This app builder owns the client entry composition layer. It wraps the entry
 * component in `UpdateEntry` so emitted entry updates flow into component props,
 * and optionally wraps that in `WaitFor` when async dependencies are configured.
 * Server-side rendering uses `createServerVueApp` instead.
 *
 * @param entry - Normalized tools entry used to build the Vue app.
 * @param createApp - Vue `createApp` function.
 * @returns Configured browser Vue app instance.
 */
export function createVueApp(
  entry: Entry<VueEntryNormalizedOptions>,
  createApp: CreateVueApp,
): App {
  const { initData = {}, waitFor, fallback } = entry.options;
  const { EntryComponent } = entry;

  const rootComponent = waitFor ? WaitFor : UpdateEntry;
  const rootProps = waitFor ? {
    component: UpdateEntry,
    wait: waitFor,
    fallback,
    childProps: {
      component: EntryComponent,
      childProps: initData,
      on: entry.on,
    },
  } : {
    component: EntryComponent,
    childProps: initData,
    on: entry.on,
  };

  const app = createApp(rootComponent, rootProps);

  setupVueEntry(app, entry.options);

  return app;
}
