import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { withDefaultProps } from '../../src/withDefaultProps';

describe('withDefaultProps', () => {
  it('fills undefined props from defaults', () => {
    const props = withDefaultProps(
      { tone: undefined },
      { tone: 'neutral', size: 'md' },
    );

    expect(props).toMatchObject({
      tone: 'neutral',
      size: 'md',
    });
  });

  it('keeps explicitly provided falsy values', () => {
    const props = withDefaultProps(
      {
        active: false,
        count: 0,
        label: '',
      },
      {
        active: true,
        count: 1,
        label: 'Default',
      },
    );

    expect(props).toMatchObject({
      active: false,
      count: 0,
      label: '',
    });
  });

  it('updates the returned object when source props change', async () => {
    const Probe = defineComponent({
      props: {
        tone: String,
      },
      setup(props) {
        const normalized = withDefaultProps<{ tone: string; size: string }>(
          props,
          { tone: 'neutral', size: 'md' },
        );

        return () => h('span', `${normalized.tone}:${normalized.size}`);
      },
    });
    const wrapper = mount(Probe, {
      props: {
        tone: 'accent',
      },
    });

    expect(wrapper.text()).toBe('accent:md');

    await wrapper.setProps({
      tone: undefined,
    });

    expect(wrapper.text()).toBe('neutral:md');
  });

  it('normalizes boolean string characters with the default option', () => {
    const enabled = withDefaultProps(
      { enabled: '+' },
      { enabled: '-' },
    );
    const disabled = withDefaultProps(
      { enabled: '-' },
      { enabled: '+' },
    );

    expect(enabled).toMatchObject({
      enabled: true,
    });
    expect(disabled).toMatchObject({
      enabled: false,
    });
  });

  it('supports custom boolean string characters', () => {
    const props = withDefaultProps(
      { expanded: 'yes' },
      { expanded: 'no' },
      { booleanChars: ['yes', 'no'] },
    );

    expect(props).toMatchObject({
      expanded: true,
    });
  });

  it('maps className defaults to Vue class by default', () => {
    const props = withDefaultProps(
      {},
      { className: 'panel', role: 'region' },
    );

    expect(props).toMatchObject({
      class: 'panel',
      role: 'region',
    });
    expect(Object.hasOwn(props as Record<string, any>, 'className')).toBe(false);
  });

  it('can keep className when className mapping is disabled', () => {
    const props = withDefaultProps(
      {},
      { className: 'panel' },
      { className: false },
    );

    expect(props).toMatchObject({
      className: 'panel',
    });
  });

  it('excludes string-matched keys from default merging', () => {
    const props = withDefaultProps(
      {
        debug: false,
      },
      {
        tone: 'neutral',
        debug: true,
        internal: 'hidden',
      },
      {
        exclude: ['debug', 'internal'],
      },
    );

    expect(props).toMatchObject({
      tone: 'neutral',
      debug: false,
    });
    expect(props).not.toHaveProperty('internal');
  });

  it('excludes regexp-matched keys from default merging', () => {
    const props = withDefaultProps(
      {},
      {
        tone: 'neutral',
        internalFlag: true,
        internalMode: 'debug',
      },
      {
        exclude: /^internal/,
      },
    );

    expect(props).toMatchObject({
      tone: 'neutral',
    });
    expect(props).not.toHaveProperty('internalFlag');
    expect(props).not.toHaveProperty('internalMode');
  });
});
