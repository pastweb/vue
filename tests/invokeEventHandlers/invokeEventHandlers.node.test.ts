import { describe, expect, it, vi } from 'vitest';
import { invokeEventHandlers } from '../../src/invokeEventHandlers';

describe('invokeEventHandlers', () => {
  it('invokes an individual callback with the supplied arguments', () => {
    const handler = vi.fn();

    invokeEventHandlers(handler, 'value', 2);

    expect(handler).toHaveBeenCalledWith('value', 2);
  });

  it('invokes every callable Vue-merged listener', () => {
    const first = vi.fn();
    const second = vi.fn();

    invokeEventHandlers([first, undefined, second], true);

    expect(first).toHaveBeenCalledWith(true);
    expect(second).toHaveBeenCalledWith(true);
  });

  it('ignores absent and non-callable handlers', () => {
    expect(() => invokeEventHandlers(undefined, 'value')).not.toThrow();
    expect(() => invokeEventHandlers('not a handler', 'value')).not.toThrow();
  });
});
