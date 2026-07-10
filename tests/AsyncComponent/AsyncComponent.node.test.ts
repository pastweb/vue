// @vitest-environment node

import { renderToString } from '@vue/server-renderer';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveAsyncTasks, TASKS } from '@pastweb/tools/ssrUtils/asyncTasks';
import { AsyncComponent } from '../../src/AsyncComponent';

const renderAsyncComponent = (props: Record<string, any>) => renderToString(
  h(AsyncComponent, props)
);

describe('AsyncComponent (server)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TASKS.splice(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TASKS.splice(0);
  });

  it('given dependencies, when async tasks resolve, then the next render contains the loaded component', async () => {
    const TestComponent = defineComponent({
      props: {
        title: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        return () => h('div', props.title);
      },
    });
    const dep1 = vi.fn().mockResolvedValue({ default: 'one' });
    const dep2 = vi.fn().mockResolvedValue({ default: 'two' });
    const component = vi.fn().mockResolvedValue({ default: TestComponent });
    const props = {
      component,
      dependencies: [dep1, dep2],
      title: 'Hello SSR',
    };

    expect(await renderAsyncComponent(props)).toBe('<!---->');

    await resolveAsyncTasks();

    expect(await renderAsyncComponent(props)).toContain('Hello SSR');
    expect(dep1).toHaveBeenCalledTimes(1);
    expect(dep2).toHaveBeenCalledTimes(1);
    expect(component).toHaveBeenCalledTimes(1);
  });

  it('given no dependencies, when async tasks resolve, then it renders the loaded component', async () => {
    const TestComponent = defineComponent({
      setup: () => () => h('div', 'No deps'),
    });
    const props = {
      component: vi.fn().mockResolvedValue({ default: TestComponent }),
    };

    expect(await renderAsyncComponent(props)).toBe('<!---->');

    await resolveAsyncTasks();

    expect(await renderAsyncComponent(props)).toContain('No deps');
  });

  it('given attrs, when the component is preloaded, then it forwards them to the loaded component', async () => {
    const TestComponent = defineComponent({
      props: {
        name: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        return () => h('span', props.name);
      },
    });
    const props = {
      component: vi.fn().mockResolvedValue({ default: TestComponent }),
      name: 'Grace',
    };

    await renderAsyncComponent(props);
    await resolveAsyncTasks();

    expect(await renderAsyncComponent(props)).toContain('Grace');
  });

  it('given a missing default export, when async tasks resolve, then it keeps rendering null', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const props = {
      component: vi.fn().mockResolvedValue({}),
      fallback: defineComponent({
        setup: () => () => h('div', 'Fallback UI'),
      }),
    };

    expect(await renderAsyncComponent(props)).toBe('<!---->');

    await resolveAsyncTasks();

    expect(await renderAsyncComponent(props)).toBe('<!---->');
    expect(consoleSpy).toHaveBeenCalledWith('AsyncComponent: No default export found');
  });

  it('given a dependency failure, when async tasks resolve, then it logs and still renders', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const dependencyError = new Error('dependency failed');
    const TestComponent = defineComponent({
      setup: () => () => h('div', 'Rendered anyway'),
    });
    const props = {
      component: vi.fn().mockResolvedValue({ default: TestComponent }),
      dependencies: [
        vi.fn().mockResolvedValue({ default: 'ok' }),
        vi.fn().mockRejectedValue(dependencyError),
      ],
    };

    expect(await renderAsyncComponent(props)).toBe('<!---->');

    await resolveAsyncTasks();

    expect(await renderAsyncComponent(props)).toContain('Rendered anyway');
    expect(consoleSpy).toHaveBeenCalledWith('dependency 1 failed:', dependencyError);
  });
});
