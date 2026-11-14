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

  it('does not normalize boolean string characters by default', () => {
    const enabled = withDefaultProps(
      { enabled: 'true' },
      { enabled: 'false' },
    );
    const disabled = withDefaultProps(
      { enabled: 'false' },
      { enabled: 'true' },
    );

    expect(enabled).toMatchObject({
      enabled: 'true',
    });
    expect(disabled).toMatchObject({
      enabled: 'false',
    });
  });

  it('normalizes default keys with DEFAULT_BOOLEAN_CHARS when enabled', () => {
    const props = withDefaultProps(
      {
        enabled: 'true',
        externalValue: 'false',
      },
      { enabled: 'false' },
      { booleanChars: true },
    );

    expect(props).toMatchObject({
      enabled: true,
      externalValue: 'false',
    });
  });

  it('does not normalize boolean string characters when explicitly disabled', () => {
    const props = withDefaultProps(
      { enabled: 'true' },
      { enabled: 'false' },
      { booleanChars: false },
    );

    expect(props).toMatchObject({
      enabled: 'true',
    });
  });

  it('does not normalize boolean string characters when the option is undefined', () => {
    const props = withDefaultProps(
      { enabled: 'true' },
      { enabled: 'false' },
      { booleanChars: undefined },
    );

    expect(props).toMatchObject({
      enabled: 'true',
    });
  });

  it('keeps plus and minus strings unless they are configured as boolean characters', () => {
    const props = withDefaultProps(
      { expanded: '+' },
      { expanded: '-' },
    );

    expect(props).toMatchObject({
      expanded: '+',
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

  it('maps Vue class props to className defaults by default', () => {
    const props = withDefaultProps(
      { class: 'custom-panel' },
      { className: 'panel', role: 'region' },
    );

    expect(props).toMatchObject({
      className: 'custom-panel',
      role: 'region',
    });
  });

  it('keeps the className default when class mapping is disabled', () => {
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
