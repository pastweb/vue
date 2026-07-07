import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reactive } from '@pastweb/tools/reactivity';
import { getContextUtils } from '@pastweb/tools/globalContext/createMediatorContextUtils';
import { useMediator } from '../../src/useMediator';
import { setContext } from '../../src/setContext';

const hmrState = vi.hoisted(() => ({
  enabled: false,
  signature: '',
}));

vi.mock('@pastweb/tools/isHMREnabled', () => ({
  isHMREnabled: () => hmrState.enabled,
}));

vi.mock('@pastweb/tools/getFunctionSignature', () => ({
  getFunctionSignature: () => hmrState.signature,
}));

function waitForMediatorUpdate(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 24));
}

describe('useMediator', () => {
  beforeEach(() => {
    hmrState.enabled = false;
    hmrState.signature = '';
  });

  it('bridges mediator state into Vue rendering', async () => {
    function createCounter() {
      const state = reactive({ count: 0 });

      return {
        state,
        increment() {
          state.count += 1;
        },
      };
    }

    const Probe = defineComponent({
      setup() {
        const counter = useMediator<ReturnType<typeof createCounter>>(createCounter);

        return () => h('button', {
          onClick: counter.increment,
        }, String(counter.state.count));
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('0');

    await wrapper.get('button').trigger('click');
    await waitForMediatorUpdate();
    await nextTick();

    expect(wrapper.text()).toBe('1');
  });

  it('keeps mediator state when component props update', async () => {
    const createCounter = vi.fn(() => {
      const state = reactive({ count: 0 });

      return {
        state,
        increment() {
          state.count += 1;
        },
      };
    });
    const Probe = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const counter = useMediator<ReturnType<typeof createCounter>>(createCounter, props);

        return () => h('div', [
          h('span', props.label),
          h('button', { onClick: counter.increment }, String(counter.state.count)),
        ]);
      },
    });
    const wrapper = mount(Probe, {
      props: {
        label: 'Before',
      },
    });

    await wrapper.get('button').trigger('click');
    await waitForMediatorUpdate();
    await nextTick();

    expect(wrapper.get('button').text()).toBe('1');

    await wrapper.setProps({
      label: 'After',
    });

    expect(createCounter).toHaveBeenCalledTimes(1);
    expect(wrapper.get('span').text()).toBe('After');
    expect(wrapper.get('button').text()).toBe('1');
  });

  it('syncs prop and extra updates into mediator inputs', async () => {
    function createLabelMediator(props: { label: string }, extras: { suffix: string }) {
      const state = reactive({ label: '' });

      return {
        state,
        copyLabel() {
          state.label = `${props.label}${extras.suffix}`;
        },
      };
    }

    const Probe = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
        suffix: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const mediator = useMediator<ReturnType<typeof createLabelMediator>>(
          createLabelMediator,
          props,
          props,
        );

        return () => h('button', {
          onClick: mediator.copyLabel,
        }, mediator.state.label || 'empty');
      },
    });
    const wrapper = mount(Probe, {
      props: {
        label: 'Before',
        suffix: '!',
      },
    });

    await wrapper.setProps({
      label: 'After',
      suffix: '?',
    });
    await wrapper.get('button').trigger('click');
    await waitForMediatorUpdate();
    await nextTick();

    expect(wrapper.text()).toBe('After?');
  });

  it('provides local context utilities inside the mediator', () => {
    function readThemeMediator() {
      const { getContext } = getContextUtils();

      return {
        theme: getContext<string>('theme'),
      };
    }

    const Child = defineComponent({
      setup() {
        const mediator = useMediator<ReturnType<typeof readThemeMediator>>(readThemeMediator);

        return () => h('span', mediator.theme);
      },
    });
    const Parent = defineComponent({
      setup() {
        setContext('theme', 'dark');

        return () => h(Child);
      },
    });
    const wrapper = mount(Parent);

    expect(wrapper.text()).toBe('dark');
  });

  it('does not forward children into mediator props', () => {
    function inspectPropsMediator(props: Record<string, any>) {
      return {
        hasChildren: Object.hasOwn(props, 'children'),
      };
    }

    const Probe = defineComponent({
      setup() {
        const mediator = useMediator<ReturnType<typeof inspectPropsMediator>>(
          inspectPropsMediator,
          { label: 'Visible', children: 'Ignored' },
        );

        return () => h('span', mediator.hasChildren ? 'children' : 'clean');
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('clean');
  });

  it('reinitializes the mediator when the HMR signature changes', async () => {
    hmrState.enabled = true;
    hmrState.signature = 'first';
    let version = 'first';
    const createVersionMediator = vi.fn(() => ({
      version,
    }));
    const Probe = defineComponent({
      props: {
        tick: {
          type: Number,
          required: true,
        },
      },
      setup(props) {
        const mediator = useMediator<ReturnType<typeof createVersionMediator>>(
          createVersionMediator,
          props,
        );

        return () => h('span', mediator.version);
      },
    });
    const wrapper = mount(Probe, {
      props: {
        tick: 0,
      },
    });

    expect(wrapper.text()).toBe('first');

    version = 'second';
    hmrState.signature = 'second';

    await wrapper.setProps({
      tick: 1,
    });
    await nextTick();

    expect(createVersionMediator).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toBe('second');
  });
});
