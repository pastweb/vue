import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { useRef } from '../../src/useRef';

describe('useRef', () => {
  it('creates a shallow ref with the initial value', () => {
    const count = useRef(1);

    expect(count.value).toBe(1);
  });

  it('updates rendered output when the ref value is replaced', async () => {
    const Probe = defineComponent({
      setup() {
        const count = useRef(1);

        return {
          count,
        };
      },
      render() {
        return h('button', {
          onClick: () => {
            this.count += 1;
          },
        }, String(this.count));
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('1');

    await wrapper.get('button').trigger('click');

    expect(wrapper.text()).toBe('2');
  });

  it('keeps nested object mutation shallow', async () => {
    const Probe = defineComponent({
      setup() {
        const state = useRef({ count: 1 });

        return {
          state,
        };
      },
      render() {
        return h('button', {
          onClick: () => {
            this.state.count += 1;
          },
        }, String(this.state.count));
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('1');

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.text()).toBe('1');
  });

  it('can store DOM element references', () => {
    let element: ReturnType<typeof useRef<HTMLElement | null>>;
    const Probe = defineComponent({
      setup() {
        element = useRef<HTMLElement | null>(null);

        return () => h('button', { ref: element }, 'Button');
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('Button');
    expect(element!.value).toBeInstanceOf(HTMLButtonElement);
  });
});
