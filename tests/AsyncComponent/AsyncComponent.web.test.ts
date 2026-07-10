import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AsyncComponent,
  type DependencyInfo,
} from '../../src/AsyncComponent';

const LoadedComponent = defineComponent({
  props: {
    name: {
      type: String,
      default: 'World',
    },
  },
  setup(props, { attrs }) {
    return () => h('div', {
      'data-testid': 'loaded-component',
      ...attrs,
    }, `Hello, ${props.name}!`);
  },
});

const LoadingSpinner = defineComponent({
  setup: () => () => h('div', { 'data-testid': 'loading' }, 'Loading...'),
});

describe('AsyncComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('given a fallback, when the component resolves, then it replaces the fallback', async () => {
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
        fallback: LoadingSpinner,
      },
    });

    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);

    await flushPromises();

    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Hello, World!');
    expect(componentLoader).toHaveBeenCalledTimes(1);
  });

  it('given no fallback, when the component is loading, then it renders nothing until resolved', async () => {
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
      },
    });

    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(false);

    await flushPromises();

    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(true);
  });

  it('given attrs, when the component resolves, then it forwards them to the loaded component', async () => {
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
        name: 'Ada',
        'data-custom': 'value',
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Hello, Ada!');
    expect(wrapper.get('[data-testid="loaded-component"]').attributes('data-custom')).toBe('value');
  });

  it('given dependencies, when they resolve, then it loads the component after them', async () => {
    const calls: string[] = [];
    const dep1 = vi.fn().mockImplementation(async () => {
      calls.push('dep1');
      return { default: 'first' };
    });
    const dep2 = vi.fn().mockImplementation(async () => {
      calls.push('dep2');
      return { default: 'second' };
    });
    const componentLoader = vi.fn().mockImplementation(async () => {
      calls.push('component');
      return { default: LoadedComponent };
    });
    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
        dependencies: [dep1, dep2],
        fallback: LoadingSpinner,
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(true);
    expect(dep1).toHaveBeenCalledTimes(1);
    expect(dep2).toHaveBeenCalledTimes(1);
    expect(componentLoader).toHaveBeenCalledTimes(1);
    expect(calls.at(-1)).toBe('component');
  });

  it('given dependency info, when it resolves, then it calls onSuccess with the selected export', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const depInfo: DependencyInfo = {
      dependency: () => Promise.resolve({ utils: { helper: 'value' } }),
      exportName: 'utils',
      onSuccess,
      onError,
    };
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });

    mount(AsyncComponent, {
      props: {
        component: componentLoader,
        dependencies: [depInfo],
      },
    });

    await flushPromises();

    expect(onSuccess).toHaveBeenCalledWith({ helper: 'value' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('given a dependency error, when loading continues, then it logs the dependency and still renders', async () => {
    const dependencyError = new Error('Bad dependency');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badDep = vi.fn().mockRejectedValue(dependencyError);
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });
    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
        dependencies: [badDep],
        fallback: LoadingSpinner,
      },
    });

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('the dependency with the index 0 has an error:', dependencyError);
    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(true);
  });

  it('given a component error, when loading fails, then it keeps the fallback visible', async () => {
    const componentError = new Error('Failed to load component');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const componentLoader = vi.fn().mockRejectedValue(componentError);
    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
        fallback: LoadingSpinner,
      },
    });

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith(componentError);
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(false);
  });

  it('given dependency info, when the dependency succeeds, then it returns the selected export to onSuccess', async () => {
    const onSuccess = vi.fn();
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });

    mount(AsyncComponent, {
      props: {
        component: componentLoader,
        dependencies: [{
          dependency: () => Promise.resolve({ profileStore: 'ready' }),
          exportName: 'profileStore',
          onSuccess,
        }],
      },
    });

    await flushPromises();

    expect(onSuccess).toHaveBeenCalledWith('ready');
  });

  it('given dependency info, when the dependency fails, then it calls onError and still renders', async () => {
    const error = new Error('load failed');
    const onError = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const componentLoader = vi.fn().mockResolvedValue({ default: LoadedComponent });

    const wrapper = mount(AsyncComponent, {
      props: {
        component: componentLoader,
        dependencies: [{
          dependency: () => Promise.reject(error),
          onError,
        }],
      },
    });

    await flushPromises();

    expect(onError).toHaveBeenCalledWith(error);
    expect(consoleSpy).toHaveBeenCalledWith('the dependency with the index 0 has an error:', error);
    expect(wrapper.find('[data-testid="loaded-component"]').exists()).toBe(true);
  });
});
