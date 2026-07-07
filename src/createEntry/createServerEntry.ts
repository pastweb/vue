import { normalizeAsyncQueue } from '@pastweb/tools/createAsyncStore/normalizeAsyncQueue';
import { createEntry as _createEntry } from '@pastweb/tools/createEntry';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { createServerVueApp, normalizeVueOptions } from './utils';
import type { Entry } from '@pastweb/tools/createEntry/types';
import type { VueEntry, VueEntryNormalizedOptions, VueEntryOptions } from './types';

/**
 * Creates a server-side Vue entry object.
 *
 * The returned entry memoizes Vue SSR rendering through the tools entry SSR
 * composition helpers and returns the generated SSR placeholder id from
 * `mount`. Browser mounting and hydration are handled by {@link createEntry}.
 *
 * @param options - Vue entry options.
 * @returns Vue entry with a server-side `mount` method.
 */
export function createServerEntry(options?: VueEntryOptions): VueEntry {
  const entry = _createEntry(normalizeVueOptions(options)) as Entry<VueEntryNormalizedOptions>;
  const { EntryComponent, fallback, waitFor } = entry.options;
  const queue = normalizeAsyncQueue(waitFor || []);

  entry.mount = () => {
    if (!EntryComponent) throw new Error('EntryComponent is required in createServerEntry options.');

    entry.memoSSR(async () => {
      let hasError = false;

      try {
        if (queue.length) await Promise.all(queue);
      } catch (error) {
        if (!fallback) throw error;

        console.error(error);
        hasError = true;
      }

      const app = createServerVueApp(entry, createSSRApp, { useFallback: hasError });

      return renderToString(app);
    });

    return entry.ssrId;
  };

  return entry as VueEntry;
}
