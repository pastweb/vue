import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { Slot } from '../../src/Slot';

describe('Slot', () => {
  it('renders the default slot when no name is provided', () => {
    const wrapper = mount(Slot, {
      slots: {
        default: () => h('p', 'Default content'),
      },
    });

    expect(wrapper.text()).toBe('Default content');
    expect(wrapper.get('p').exists()).toBe(true);
  });

  it('resolves the default slot owned by its parent when name is omitted', () => {
    const Owner = defineComponent({
      setup: () => () => h(Slot),
    });
    const wrapper = mount(Owner, {
      slots: {
        default: () => h('p', 'Owner default content'),
      },
    });

    expect(wrapper.text()).toBe('Owner default content');
  });

  it('renders the requested named slot', () => {
    const wrapper = mount(Slot, {
      props: {
        name: 'header',
      },
      slots: {
        default: () => h('p', 'Default content'),
        header: () => h('h1', 'Header content'),
      },
    });

    expect(wrapper.text()).toBe('Header content');
    expect(wrapper.get('h1').exists()).toBe(true);
  });

  it('falls back to the default slot when the named slot is missing', () => {
    const wrapper = mount(Slot, {
      props: {
        name: 'missing',
      },
      slots: {
        default: () => h('span', 'Fallback content'),
      },
    });

    expect(wrapper.text()).toBe('Fallback content');
  });

  it('renders the named slot owned by its parent component', () => {
    const Owner = defineComponent({
      setup: () => () => h(Slot, { name: 'header' }),
    });
    const wrapper = mount(Owner, {
      slots: {
        header: () => h('h1', 'Owner slot content'),
      },
    });

    expect(wrapper.text()).toBe('Owner slot content');
    expect(wrapper.get('h1').exists()).toBe(true);
  });

  it('passes props to a scoped slot owned by its parent component', () => {
    const Owner = defineComponent({
      setup: () => () => h(Slot, {
        name: 'check',
        props: { checkChar: '✓' },
      }),
    });
    const wrapper = mount(Owner, {
      slots: {
        check: ({ checkChar }) => h('span', { class: 'check' }, checkChar),
      },
    });

    expect(wrapper.get('.check').text()).toBe('✓');
  });

  it('clones a single slot vnode with additional props', async () => {
    const onClick = vi.fn();
    const wrapper = mount(Slot, {
      props: {
        props: {
          class: 'primary',
          onClick,
        },
      },
      slots: {
        default: () => h('button', 'Save'),
      },
    });

    expect(wrapper.get('button').classes()).toContain('primary');

    await wrapper.get('button').trigger('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('clones every vnode when the slot returns multiple children', () => {
    const wrapper = mount(Slot, {
      props: {
        props: {
          class: 'item',
        },
      },
      slots: {
        default: () => [
          h('span', 'One'),
          h('span', 'Two'),
        ],
      },
    });

    const items = wrapper.findAll('span');

    expect(items).toHaveLength(2);
    expect(items[0].classes()).toContain('item');
    expect(items[1].classes()).toContain('item');
  });

  it('maps single slot content with index zero when a map function is provided', () => {
    const map = vi.fn((content, index) => h('section', { class: `mapped mapped-${index}` }, content));
    const wrapper = mount(Slot, {
      props: {
        map,
        props: {
          class: 'ignored',
        },
      },
      slots: {
        default: () => h('strong', 'Mapped content'),
      },
    });

    expect(map).toHaveBeenCalledTimes(1);
    expect(map).toHaveBeenCalledWith(expect.any(Object), 0);
    expect(wrapper.get('section').classes()).toContain('mapped');
    expect(wrapper.get('section').classes()).toContain('mapped-0');
    expect(wrapper.find('strong').classes()).not.toContain('ignored');
    expect(wrapper.text()).toBe('Mapped content');
  });

  it('maps every slot vnode with its index when multiple children are provided', () => {
    const map = vi.fn((content, index) => h('section', { class: `mapped-${index}` }, content));
    const wrapper = mount(Slot, {
      props: {
        map,
      },
      slots: {
        default: () => [
          h('span', 'One'),
          h('span', 'Two'),
        ],
      },
    });

    const sections = wrapper.findAll('section');

    expect(map).toHaveBeenCalledTimes(2);
    expect(map).toHaveBeenNthCalledWith(1, expect.any(Object), 0);
    expect(map).toHaveBeenNthCalledWith(2, expect.any(Object), 1);
    expect(sections[0].classes()).toContain('mapped-0');
    expect(sections[1].classes()).toContain('mapped-1');
    expect(wrapper.text()).toBe('OneTwo');
  });

  it('maps parent-owned slot content', () => {
    const Owner = defineComponent({
      setup: () => () => h(Slot, {
        name: 'default',
        map: (content, index) => h('section', { class: `item-${index}` }, content),
      }),
    });
    const wrapper = mount(Owner, {
      slots: {
        default: () => [h('span', 'One'), h('span', 'Two')],
      },
    });

    expect(wrapper.findAll('section')).toHaveLength(2);
    expect(wrapper.get('.item-0').text()).toBe('One');
    expect(wrapper.get('.item-1').text()).toBe('Two');
  });
});
