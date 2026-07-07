// @vitest-environment node

import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { createServerEntry } from '../../src/createEntry';

describe('createServerEntry', () => {
  it('returns the ssrId from mount', () => {
    const App = defineComponent({
      setup: () => () => h('div', 'Hello SSR'),
    });

    const entry = createServerEntry({
      EntryComponent: App,
    });

    const ssrId = entry.mount();

    expect(ssrId).toBeDefined();
    expect(typeof ssrId).toBe('string');
  });

  it('renders component HTML through getComposedSSR', async () => {
    const App = defineComponent({
      props: {
        name: {
          type: String,
          default: 'World',
        },
      },
      setup: props => () => h('div', `Hello, ${props.name}!`),
    });

    const entry = createServerEntry({
      EntryComponent: App,
      initData: {
        name: 'Vue SSR',
      },
    });

    entry.mount();

    const html = await entry.getComposedSSR();

    expect(html).toContain('Hello, Vue SSR!');
  });

  it('waits for SSR dependencies before rendering', async () => {
    const App = defineComponent({
      setup: () => () => h('div', 'Waited SSR'),
    });

    const entry = createServerEntry({
      EntryComponent: App,
      waitFor: [Promise.resolve()],
    });

    entry.mount();

    const html = await entry.getComposedSSR();

    expect(html).toContain('Waited SSR');
  });
});
