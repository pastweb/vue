import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { getContext } from '../../src/getContext';
import { setContext } from '../../src/setContext';

describe('getContext', () => {
  it('reads a value provided with setContext', () => {
    const Child = defineComponent({
      setup() {
        const session = getContext<{ userId: string }>('session');

        return () => h('span', session.userId);
      },
    });
    const Parent = defineComponent({
      setup() {
        setContext('session', {
          userId: 'user-1',
        });

        return () => h(Child);
      },
    });

    const wrapper = mount(Parent);

    expect(wrapper.text()).toBe('user-1');
  });

  it('returns undefined when the provider is optional and missing', () => {
    const Probe = defineComponent({
      setup() {
        const value = getContext<string | undefined>('missing');

        return () => h('span', value ?? 'empty');
      },
    });

    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('empty');
  });
});
