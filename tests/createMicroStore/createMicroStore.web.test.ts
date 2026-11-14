import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { createMicroStore as createToolsMicroStore } from '@pastweb/tools/createMicroStore';
import { createMicroStore, reuseMicroStore } from '../../src/createMicroStore';

async function waitFor(assertion: () => void) {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 1000) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  throw lastError;
}

describe('createMicroStore', () => {
  it('given a tools micro-store, when an action updates state, then reuseMicroStore rerenders Vue', async () => {
    const counterStore = createToolsMicroStore('vue-counter-full', () => ({
      state: {
        count: 0,
      },
      actions: {
        increment() {
          this.state.count += 1;
        },
      },
    }));
    const useCounterStore = reuseMicroStore(counterStore);
    const Counter = defineComponent({
      setup() {
        const counter = useCounterStore();

        return () => h('button', { onClick: counter.increment }, counter.state.count);
      },
    });
    const wrapper = mount(Counter);

    expect(wrapper.text()).toBe('0');

    await wrapper.get('button').trigger('click');

    await waitFor(() => {
      expect(wrapper.text()).toBe('1');
    });
  });

  it('given a Vue micro-store, when a selector is used, then selected state updates after actions', async () => {
    const useUserStore = createMicroStore('vue-user-selected', () => ({
      state: {
        user: {
          name: 'Ada',
        },
      },
      actions: {
        rename(name: string) {
          this.state.user.name = name;
        },
      },
    }));
    const UserName = defineComponent({
      setup() {
        const user = useUserStore(state => state.user.name);

        return () => h('button', { onClick: () => user.rename('Grace') }, user.state);
      },
    });
    const wrapper = mount(UserName);

    expect(wrapper.text()).toBe('Ada');

    await wrapper.get('button').trigger('click');

    await waitFor(() => {
      expect(wrapper.text()).toBe('Grace');
    });
  });

  it('given a deeply nested full store, when a nested action runs, then Vue sees the nested change', async () => {
    const settingsStore = createToolsMicroStore('vue-settings-deep-full', () => ({
      state: {
        account: {
          preferences: {
            theme: {
              palette: {
                accent: 'blue',
              },
            },
          },
        },
      },
      actions: {
        setAccent(accent: string) {
          this.state.account.preferences.theme.palette.accent = accent;
        },
      },
    }));
    const useSettingsStore = reuseMicroStore(settingsStore);
    const Accent = defineComponent({
      setup() {
        const settings = useSettingsStore();

        return () => h(
          'button',
          { onClick: () => settings.setAccent('green') },
          settings.state.account.preferences.theme.palette.accent,
        );
      },
    });
    const wrapper = mount(Accent);

    expect(wrapper.text()).toBe('blue');

    await wrapper.get('button').trigger('click');

    await waitFor(() => {
      expect(wrapper.text()).toBe('green');
    });
  });

  it('given a deeply nested selected object, when a nested action runs, then Vue sees the selected object change', async () => {
    const useProfileStore = createMicroStore('vue-profile-deep-selected', () => ({
      state: {
        profile: {
          contact: {
            address: {
              city: 'London',
            },
          },
        },
      },
      actions: {
        move(city: string) {
          this.state.profile.contact.address.city = city;
        },
      },
    }));
    const City = defineComponent({
      setup() {
        const contact = useProfileStore(state => state.profile.contact);

        return () => h('button', { onClick: () => contact.move('Rome') }, contact.state.address.city);
      },
    });
    const wrapper = mount(City);

    expect(wrapper.text()).toBe('London');

    await wrapper.get('button').trigger('click');

    await waitFor(() => {
      expect(wrapper.text()).toBe('Rome');
    });
  });
});
