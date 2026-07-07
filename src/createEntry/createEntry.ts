import { createEntry as _createEntry } from '@pastweb/tools/createEntry';
import { type App, createApp } from 'vue';
import { createVueApp, normalizeVueOptions } from './utils';
import type { Entry } from '@pastweb/tools/createEntry/types';
import type { VueEntryOptions, VueEntryNormalizedOptions, VueEntry } from './types';

/**
 * Creates a browser-side Vue entry object.
 *
 * The returned entry mounts a Vue application into `entryElement` or
 * `querySelector`, and can later unmount the same app instance. Server-side
 * rendering is handled by {@link createServerEntry}.
 *
 * @param options - Vue entry options.
 * @returns Vue entry with browser mount and unmount methods.
 */
export function createEntry(options?: VueEntryOptions): VueEntry {
  const entry = _createEntry(normalizeVueOptions(options)) as Entry<VueEntryNormalizedOptions>;

  let app: App<any>;

  entry.mount = (hydrate = false) => {
    if (!entry.querySelector && !entry.entryElement) {
      throw new Error('VueEntry error: the options must contain the "querySelector" or "entryElement" property.');
    }

    app = createVueApp(entry, createApp);
    
    app.mount(entry.entryElement as HTMLElement || entry.querySelector as string, hydrate);
  };

  entry.unmount = () => app.unmount();
  
  return entry as VueEntry;
}
