import { mount } from '@vue/test-utils';
import { defineComponent, h, markRaw } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { Render } from '../../src/Render';

describe('Render', () => {
  it('renders string content as text', () => {
    const wrapper = mount(Render, {
      props: {
        content: 'Hello Render',
      },
    });

    expect(wrapper.text()).toBe('Hello Render');
  });

  it('renders number content as text', () => {
    const wrapper = mount(Render, {
      props: {
        content: 42,
      },
    });

    expect(wrapper.text()).toBe('42');
  });

  it('clones a VNode and merges props into it', async () => {
    const onClick = vi.fn();
    const wrapper = mount(Render, {
      props: {
        content: h('button', 'Open'),
        props: {
          class: 'primary',
          onClick,
        },
      },
    });

    expect(wrapper.get('button').classes()).toContain('primary');

    await wrapper.get('button').trigger('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a component definition with props', () => {
    const Badge = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        return () => h('span', props.label);
      },
    });
    const wrapper = mount(Render, {
      props: {
        content: markRaw(Badge),
        props: {
          label: 'Ready',
        },
      },
    });

    expect(wrapper.text()).toBe('Ready');
  });
});
