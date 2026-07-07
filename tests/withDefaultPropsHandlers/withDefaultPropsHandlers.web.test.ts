import { nextTick, reactive } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { withDefaultPropsHandlers } from '../../src/withDefaultPropsHandlers';

describe('withDefaultPropsHandlers', () => {
  it('merges regular defaults and separates Vue-style event handlers', async () => {
    const onClick = vi.fn();
    const onChange = vi.fn();
    const props = reactive<Record<string, any>>({
      tone: undefined,
      onClick,
    });
    const [normalizedProps, events] = withDefaultPropsHandlers<{
      tone: string;
      block: boolean;
      class: string;
    }>(props, {
      tone: 'neutral',
      block: '-',
      className: 'button',
      onClick: vi.fn(),
      onChange,
    });

    await nextTick();

    expect(normalizedProps).toMatchObject({
      tone: 'neutral',
      block: false,
      class: 'button',
    });
    expect(normalizedProps).not.toHaveProperty('onClick');
    expect(normalizedProps).not.toHaveProperty('onChange');
    expect(events).toEqual({
      click: onClick,
      change: onChange,
    });
  });

  it('keeps ordinary props that start with lowercase on', async () => {
    const props = reactive<Record<string, any>>({});
    const online = vi.fn();
    const once = vi.fn();
    const [normalizedProps, events] = withDefaultPropsHandlers(props, {
      online,
      once,
      onClick: vi.fn(),
    });

    await nextTick();

    expect(normalizedProps.online).toBe(online);
    expect(normalizedProps.once).toBe(once);
    expect(events).toEqual({
      click: expect.any(Function),
    });
    expect(events).not.toHaveProperty('line');
    expect(events).not.toHaveProperty('ce');
  });

  it('supports separate exclusions for props and handlers', async () => {
    const onClick = vi.fn();
    const onInternalReady = vi.fn();
    const props = reactive<Record<string, any>>({});
    const [normalizedProps, events] = withDefaultPropsHandlers(
      props,
      {
        tone: 'neutral',
        debug: true,
        onClick,
        onInternalReady,
      },
      {
        excludeProps: 'debug',
        excludeHandlers: /^internal/,
      },
    );

    await nextTick();

    expect(normalizedProps).toMatchObject({
      tone: 'neutral',
    });
    expect(normalizedProps).not.toHaveProperty('debug');
    expect(events).toEqual({
      click: onClick,
    });
  });

  it('reacts when source props change', async () => {
    const props = reactive<Record<string, any>>({
      tone: 'neutral',
    });
    const [normalizedProps] = withDefaultPropsHandlers<{ tone: string }>(props, {
      tone: 'accent',
    });

    expect(normalizedProps.tone).toBe('neutral');

    props.tone = undefined;
    await nextTick();

    expect(normalizedProps.tone).toBe('accent');
  });
});
