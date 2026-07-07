import { describe, expect, it, vi } from 'vitest';
import { getEventHandlers } from '../../src/getEventHandlers';

describe('getEventHandlers', () => {
  it('extracts Vue-style event handlers and converts names to kebab case', () => {
    const onClick = vi.fn();
    const onMyCustomEvent = vi.fn();
    const onUpdateModelValue = vi.fn();

    const events = getEventHandlers({
      title: 'Hello',
      onClick,
      onMyCustomEvent,
      onUpdateModelValue,
    });

    expect(events).toEqual({
      click: onClick,
      'my-custom-event': onMyCustomEvent,
      'update-model-value': onUpdateModelValue,
    });
  });

  it('ignores non-functions and regular props that start with lowercase on', () => {
    const online = vi.fn();
    const once = vi.fn();

    const events = getEventHandlers({
      onClick: 'not-a-handler',
      online,
      once,
      onSubmit: vi.fn(),
    });

    expect(events).toEqual({
      submit: expect.any(Function),
    });
    expect(events).not.toHaveProperty('line');
    expect(events).not.toHaveProperty('ce');
    expect(events).not.toHaveProperty('click');
  });

  it('excludes event names with string and regexp rules', () => {
    const onClick = vi.fn();
    const onUpdateModelValue = vi.fn();
    const onInternalReady = vi.fn();

    const events = getEventHandlers(
      {
        onClick,
        onUpdateModelValue,
        onInternalReady,
      },
      {
        exclude: ['update-model-value', /^internal/],
      },
    );

    expect(events).toEqual({
      click: onClick,
    });
  });
});
