// @vitest-environment node

import { renderToString } from '@vue/server-renderer';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { resolveAsyncTasks } from '@pastweb/tools/ssrUtils/asyncTasks';
import { createEntry, createServerEntry } from '../../src/createEntry';
import { EntryAdapter } from '../../src/EntryAdapter';

describe('EntryAdapter (server)', () => {
  it('uses entry on the server when ssrEntry is not provided', async () => {
    const Shared = defineComponent({
      props: {
        name: {
          type: String,
          required: true,
        },
      },
      setup: props => () => h('div', `Shared entry for ${props.name}`),
    });
    const sharedEntry = createServerEntry({
      EntryComponent: Shared,
    });

    const html = await renderToString(h(EntryAdapter, {
      entry: () => sharedEntry,
      name: 'Grace',
    }));

    expect(html).toContain(sharedEntry.ssrId);

    const composed = await sharedEntry.getComposedSSR();

    expect(composed).toContain('Shared entry for');
    expect(composed).toContain('Grace');
  });

  it('loads the server entry through async tasks and uses it on the next render pass', async () => {
    const Client = defineComponent({
      setup: () => () => h('div', 'Client entry'),
    });
    const Server = defineComponent({
      props: {
        name: {
          type: String,
          required: true,
        },
      },
      setup: props => () => h('div', `Server entry for ${props.name}`),
    });
    const clientEntry = createEntry({
      EntryComponent: Client,
    });
    const serverEntry = createServerEntry({
      EntryComponent: Server,
    });
    const loadServerEntry = vi.fn(async () => serverEntry);
    const renderAdapter = () => renderToString(h(EntryAdapter, {
      entry: () => clientEntry,
      ssrEntry: loadServerEntry,
      name: 'Ada',
    }));

    await renderAdapter();

    expect(loadServerEntry).not.toHaveBeenCalled();

    await resolveAsyncTasks();

    expect(loadServerEntry).toHaveBeenCalledTimes(1);
    expect(await renderAdapter()).toContain(serverEntry.ssrId);

    const composed = await serverEntry.getComposedSSR();

    expect(composed).toContain('Server entry for');
    expect(composed).toContain('Ada');
  });
});
