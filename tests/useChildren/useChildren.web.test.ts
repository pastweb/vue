import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { useChildren } from '../../src/useChildren';

describe('useChildren', () => {
  it('returns default slot children for the current component', () => {
    const Probe = defineComponent({
      setup() {
        const children = useChildren();

        return () => h('section', children);
      },
    });
    const wrapper = mount(Probe, {
      slots: {
        default: () => h('span', 'Child content'),
      },
    });

    expect(wrapper.get('section').text()).toBe('Child content');
    expect(wrapper.get('span').exists()).toBe(true);
  });

  it('returns multiple default slot children in order', () => {
    const Probe = defineComponent({
      setup() {
        const children = useChildren();

        return () => h('section', children);
      },
    });
    const wrapper = mount(Probe, {
      slots: {
        default: () => [
          h('span', 'One'),
          h('strong', 'Two'),
        ],
      },
    });

    expect(wrapper.get('section').text()).toBe('OneTwo');
    expect(wrapper.findAll('span')).toHaveLength(1);
    expect(wrapper.findAll('strong')).toHaveLength(1);
  });

  it('returns an empty array when there is no default slot', () => {
    let childrenLength = -1;
    const Probe = defineComponent({
      setup() {
        const children = useChildren();
        childrenLength = children.length;

        return () => h('section', children);
      },
    });
    const wrapper = mount(Probe);

    expect(childrenLength).toBe(0);
    expect(wrapper.get('section').text()).toBe('');
  });
});
