import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useMounted } from '../../src/useMounted';

describe('useMounted', () => {
  it('runs after the component mounts', () => {
    const events: string[] = [];
    const mounted = vi.fn(() => {
      events.push('useMounted');
    });
    const Probe = defineComponent({
      setup() {
        events.push('setup');
        useMounted(mounted);

        return () => {
          events.push('render');
          return h('span', 'Ready');
        };
      },
      mounted() {
        events.push('mounted');
      },
    });

    mount(Probe);

    expect(mounted).toHaveBeenCalledTimes(1);
    expect(events.indexOf('setup')).toBeLessThan(events.indexOf('useMounted'));
    expect(events.indexOf('render')).toBeLessThan(events.indexOf('useMounted'));
  });

  it('runs once and does not run again when the component updates', async () => {
    const mounted = vi.fn();
    const Probe = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        useMounted(mounted);

        return () => h('span', props.label);
      },
    });
    const wrapper = mount(Probe, {
      props: {
        label: 'Before',
      },
    });

    expect(mounted).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      label: 'After',
    });

    expect(mounted).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toBe('After');
  });

  it('invokes async callbacks without treating them as cleanup', async () => {
    const events: string[] = [];
    let resolveCallback: () => void = () => {};
    const mounted = vi.fn(() => new Promise<void>(resolve => {
      resolveCallback = () => {
        events.push('resolved');
        resolve();
      };
    }));
    const Probe = defineComponent({
      setup() {
        useMounted(mounted);

        return () => h('span', 'Mounted');
      },
      unmounted() {
        events.push('unmounted');
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('Mounted');
    expect(events).toEqual([]);

    resolveCallback();
    await nextTick();

    wrapper.unmount();

    expect(mounted).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['resolved', 'unmounted']);
  });
});
