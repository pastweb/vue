import { mount } from '@vue/test-utils';
import { h } from 'vue';
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

  it('maps slot content when a map function is provided', () => {
    const map = vi.fn(content => h('section', { class: 'mapped' }, content));
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
    expect(wrapper.get('section').classes()).toContain('mapped');
    expect(wrapper.find('strong').classes()).not.toContain('ignored');
    expect(wrapper.text()).toBe('Mapped content');
  });
});
