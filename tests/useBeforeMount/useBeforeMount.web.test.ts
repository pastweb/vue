import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useBeforeMount } from '../../src/useBeforeMount';

describe('useBeforeMount', () => {
  it('runs before the component is mounted', () => {
    const events: string[] = [];
    const beforeMount = vi.fn(() => {
      events.push('beforeMount');
    });
    const Probe = defineComponent({
      setup() {
        events.push('setup');
        useBeforeMount(beforeMount);

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

    expect(beforeMount).toHaveBeenCalledTimes(1);
    expect(events.indexOf('setup')).toBeLessThan(events.indexOf('beforeMount'));
    expect(events.indexOf('beforeMount')).toBeLessThan(events.indexOf('mounted'));
  });

  it('runs once and does not run again when the component updates', async () => {
    const beforeMount = vi.fn();
    const Probe = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        useBeforeMount(beforeMount);

        return () => h('span', props.label);
      },
    });
    const wrapper = mount(Probe, {
      props: {
        label: 'Before',
      },
    });

    expect(beforeMount).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toBe('Before');

    await wrapper.setProps({
      label: 'After',
    });

    expect(beforeMount).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toBe('After');
  });

  it('invokes async callbacks without blocking mount', async () => {
    const events: string[] = [];
    let resolveCallback: () => void = () => {};
    const beforeMount = vi.fn(() => new Promise<void>(resolve => {
      resolveCallback = () => {
        events.push('resolved');
        resolve();
      };
    }));
    const Probe = defineComponent({
      setup() {
        useBeforeMount(beforeMount);

        return () => h('span', 'Mounted');
      },
      mounted() {
        events.push('mounted');
      },
    });

    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('Mounted');
    expect(events).toEqual(['mounted']);

    resolveCallback();
    await nextTick();

    expect(beforeMount).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['mounted', 'resolved']);
  });
});
