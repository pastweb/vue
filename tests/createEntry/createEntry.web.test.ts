import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createEntry } from '../../src/createEntry';

async function waitFor(assertion: () => void) {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 1000) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  throw lastError;
}

describe('createEntry', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates a Vue entry object', () => {
    const entry = createEntry({
      entryElement: container,
    });

    expect(entry).toBeDefined();
    expect(typeof entry.mount).toBe('function');
    expect(typeof entry.unmount).toBe('function');
  });

  it('mounts a component', async () => {
    const App = defineComponent({
      setup: () => () => h('div', 'Hello World'),
    });

    const entry = createEntry({
      EntryComponent: App,
      entryElement: container,
    });

    entry.mount();

    await waitFor(() => {
      expect(container.textContent).toContain('Hello World');
    });
  });

  it('hydrates a server-rendered application', async () => {
    container.innerHTML = '<div>Hydrated App</div>';

    const App = defineComponent({
      setup: () => () => h('div', 'Hydrated App'),
    });

    const entry = createEntry({
      EntryComponent: App,
      entryElement: container,
    });

    entry.mount(true);

    await waitFor(() => {
      expect(container.textContent).toContain('Hydrated App');
    });
  });

  it('unmounts the application', async () => {
    const App = defineComponent({
      setup: () => () => h('div', 'Unmount Test'),
    });

    const entry = createEntry({
      EntryComponent: App,
      entryElement: container,
    });

    entry.mount();

    await waitFor(() => {
      expect(container.textContent).toContain('Unmount Test');
    });

    entry.unmount();
    await nextTick();

    expect(container.innerHTML).toBe('');
  });

  it('passes initData to the rendered component', async () => {
    const App = defineComponent({
      props: {
        title: String,
      },
      setup: props => () => h('div', props.title),
    });

    const entry = createEntry({
      EntryComponent: App,
      initData: {
        title: 'Hello Entry',
      },
      entryElement: container,
    });

    entry.mount();

    await waitFor(() => {
      expect(container.textContent).toContain('Hello Entry');
    });
  });

  it('registers update listeners through UpdateEntry', async () => {
    const App = defineComponent({
      props: {
        title: String,
      },
      setup: props => () => h('div', props.title),
    });

    const entry = createEntry({
      EntryComponent: App,
      initData: {
        title: 'Before Update',
      },
      entryElement: container,
    });

    entry.mount();

    await waitFor(() => {
      expect(container.textContent).toContain('Before Update');
    });

    entry.emit('update', {
      title: 'After Update',
    });

    await waitFor(() => {
      expect(container.textContent).toContain('After Update');
    });
  });

  it('supports waitFor async dependencies', async () => {
    let resolve!: () => void;
    const wait = new Promise<void>(res => {
      resolve = res;
    });
    const App = defineComponent({
      setup: () => () => h('div', 'Async App'),
    });
    const Fallback = defineComponent({
      setup: () => () => h('div', 'Loading...'),
    });

    const entry = createEntry({
      EntryComponent: App,
      waitFor: [wait],
      fallback: Fallback,
      entryElement: container,
    });

    entry.mount();

    await waitFor(() => {
      expect(container.textContent).toContain('Loading...');
    });

    resolve();

    await waitFor(() => {
      expect(container.textContent).toContain('Async App');
    });
  });
});
