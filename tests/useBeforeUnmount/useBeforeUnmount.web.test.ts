import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useBeforeUnmount } from '../../src/useBeforeUnmount';

describe('useBeforeUnmount', () => {
  it('runs before the component unmounts', () => {
    const events: string[] = [];
    const beforeUnmount = vi.fn(() => {
      events.push('beforeUnmount');
    });
    const Probe = defineComponent({
      setup() {
        useBeforeUnmount(beforeUnmount);

        return () => h('span', 'Mounted');
      },
      unmounted() {
        events.push('unmounted');
      },
    });
    const wrapper = mount(Probe);

    wrapper.unmount();

    expect(beforeUnmount).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['beforeUnmount', 'unmounted']);
  });

  it('does not run during component updates', async () => {
    const beforeUnmount = vi.fn();
    const Probe = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        useBeforeUnmount(beforeUnmount);

        return () => h('span', props.label);
      },
    });
    const wrapper = mount(Probe, {
      props: {
        label: 'Before',
      },
    });

    await wrapper.setProps({
      label: 'After',
    });

    expect(beforeUnmount).not.toHaveBeenCalled();

    wrapper.unmount();

    expect(beforeUnmount).toHaveBeenCalledTimes(1);
  });

  it('invokes async callbacks without blocking unmount', async () => {
    const events: string[] = [];
    let resolveCallback: () => void = () => {};
    const beforeUnmount = vi.fn(() => new Promise<void>(resolve => {
      resolveCallback = () => {
        events.push('resolved');
        resolve();
      };
    }));
    const Probe = defineComponent({
      setup() {
        useBeforeUnmount(beforeUnmount);

        return () => h('span', 'Mounted');
      },
      unmounted() {
        events.push('unmounted');
      },
    });
    const wrapper = mount(Probe);

    wrapper.unmount();

    expect(events).toEqual(['unmounted']);

    resolveCallback();
    await nextTick();

    expect(beforeUnmount).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['unmounted', 'resolved']);
  });
});
