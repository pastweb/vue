import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { createEntry } from '@pastweb/tools/createEntry';
import { Island } from '../../src/Island';
import { EntryAdapter } from '../../src/EntryAdapter';

function createMockEntry() {
  const entry = createEntry();
  entry.mount = vi.fn();
  entry.update = vi.fn();
  entry.unmount = vi.fn();

  return entry;
}

describe('EntryAdapter', () => {
  it('mounts entries without hydration outside an island', () => {
    const entry = createMockEntry();

    mount(EntryAdapter, {
      props: {
        entry: () => entry,
      },
    });

    expect(entry.mount).toHaveBeenCalledWith(false);
    expect(entry.entryElement).toBeInstanceOf(HTMLElement);
  });

  it('hydrates entries rendered inside an island', () => {
    const entry = createMockEntry();

    mount(Island, {
      props: {
        client: 'none',
      },
      slots: {
        default: () => h(EntryAdapter, { entry: () => entry }),
      },
    });

    expect(entry.mount).toHaveBeenCalledWith(true);
  });

  it('passes rest props as initData and updates them after mount', async () => {
    const entry = createMockEntry();
    const wrapper = mount(EntryAdapter, {
      props: {
        entry: () => entry,
        title: 'Before',
      },
    });

    expect(entry.options.initData).toEqual({
      title: 'Before',
    });

    await wrapper.setProps({
      title: 'After',
    });

    expect(entry.update).toHaveBeenCalledWith({
      title: 'After',
    });
  });

  it('accepts ssrEntry without forwarding it as entry data', async () => {
    const entry = createMockEntry();
    const ssrEntry = vi.fn(async () => createMockEntry());
    const wrapper = mount(EntryAdapter, {
      props: {
        entry: () => entry,
        ssrEntry,
        title: 'Before',
      },
    });

    expect(entry.options.initData).toEqual({
      title: 'Before',
    });

    await wrapper.setProps({
      ssrEntry,
      title: 'After',
    });

    expect(entry.update).toHaveBeenCalledWith({
      title: 'After',
    });
    expect(ssrEntry).not.toHaveBeenCalled();
  });

  it('unmounts the entry when the adapter unmounts', () => {
    const entry = createMockEntry();
    const wrapper = mount(EntryAdapter, {
      props: {
        entry: () => entry,
      },
    });

    wrapper.unmount();

    expect(entry.unmount).toHaveBeenCalled();
  });

  it('throws when the factory does not return a tools entry', () => {
    expect(() => mount(EntryAdapter, {
      props: {
        entry: () => ({}) as any,
      },
    })).toThrow('The entry must be generate via "createEntry" function.');
  });
});
