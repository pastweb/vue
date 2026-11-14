import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Remote } from '../../src/Remote';

const LoadedComponent = defineComponent({
  setup: () => () => h('div', { 'data-testid': 'remote-content' }, 'Remote content'),
});

const LoadingComponent = defineComponent({
  setup: () => () => h('div', { 'data-testid': 'loading' }, 'Loading'),
});

const ErrorComponent = defineComponent({
  setup: () => () => h('div', { 'data-testid': 'remote-error' }, 'Unable to load remote'),
});

describe('Remote', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('waits for one dependency before loading the remote component', async () => {
    let resolveDependency!: () => void;
    const dependency = vi.fn(() => new Promise<void>(resolve => {
      resolveDependency = resolve;
    }));
    const component = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(Remote, {
      props: {
        component,
        dependency,
        fallback: LoadingComponent,
      },
    });

    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
    expect(component).not.toHaveBeenCalled();

    resolveDependency();
    await flushPromises();

    expect(wrapper.find('[data-testid="remote-content"]').exists()).toBe(true);
    expect(component).toHaveBeenCalledOnce();
  });

  it('waits for every dependency before loading the remote component', async () => {
    const firstDependency = vi.fn().mockResolvedValue(undefined);
    const secondDependency = vi.fn().mockResolvedValue(undefined);
    const component = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(Remote, {
      props: {
        component,
        dependency: [firstDependency, secondDependency],
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="remote-content"]').exists()).toBe(true);
    expect(firstDependency).toHaveBeenCalledOnce();
    expect(secondDependency).toHaveBeenCalledOnce();
    expect(component).toHaveBeenCalledOnce();
  });

  it('renders the error fallback when a dependency fails', async () => {
    const error = new Error('Dependency failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const component = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(Remote, {
      props: {
        component,
        dependency: vi.fn().mockRejectedValue(error),
        errorFallback: ErrorComponent,
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="remote-error"]').exists()).toBe(true);
    expect(component).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('Remote dependency loading error:', error);
  });

  it('renders the error fallback when the remote module fails to load', async () => {
    const error = new Error('Remote module failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(Remote, {
      props: {
        component: vi.fn().mockRejectedValue(error),
        errorFallback: ErrorComponent,
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="remote-error"]').exists()).toBe(true);
    expect(consoleError).toHaveBeenCalledWith('Remote component loading error:', error);
  });
});
