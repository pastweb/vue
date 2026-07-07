import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ISLAND_PROPS, ISLAND_CONTEXT_KEY } from '@pastweb/tools/Island';
import { DEFAULT_PROPS, Island, useIsland } from '../../src/Island';

function createStatusComponent() {
  return defineComponent({
    setup() {
      const isIsland = useIsland();

      return () => h('span', isIsland ? 'inside' : 'outside');
    },
  });
}

describe('Island', () => {
  it('uses the shared tools defaults and island context key', () => {
    expect(DEFAULT_PROPS).toBe(DEFAULT_ISLAND_PROPS);
    expect(ISLAND_CONTEXT_KEY).toBe('$$ISLAND_CONTEXT_KEY');
  });

  it('renders island content and exposes the optional island id', () => {
    const wrapper = mount(Island, {
      props: {
        client: 'none',
        islandId: 'profile',
      },
      slots: {
        default: () => h('span', 'Profile'),
      },
    });

    expect(wrapper.text()).toContain('Profile');
    expect(wrapper.get('[data-island]').attributes('data-island-id')).toBe('profile');
  });

  it('exposes island state to descendants and defaults to false', () => {
    const IslandStatus = createStatusComponent();
    const Outside = mount(IslandStatus);
    const Inside = mount(Island, {
      props: {
        client: 'none',
      },
      slots: {
        default: () => h(IslandStatus),
      },
    });

    expect(Outside.text()).toBe('outside');
    expect(Inside.text()).toBe('inside');
  });

  it('reads island state from Vue provide when there is no local Island component', () => {
    const IslandStatus = createStatusComponent();
    const Root = defineComponent({
      setup() {
        return () => h(IslandStatus);
      },
    });

    const wrapper = mount(Root, {
      global: {
        provide: {
          [ISLAND_CONTEXT_KEY]: true,
        },
      },
    });

    expect(wrapper.text()).toBe('inside');
  });

  it('emits hydrated when the load strategy runs', async () => {
    const wrapper = mount(Island, {
      props: {
        client: 'load',
      },
      slots: {
        default: () => h('span', 'Load Island'),
      },
    });

    await vi.waitFor(() => {
      expect(wrapper.emitted('hydrated')).toHaveLength(1);
    });
  });
});
