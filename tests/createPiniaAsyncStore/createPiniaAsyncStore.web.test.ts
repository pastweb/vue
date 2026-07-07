import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AsyncStoreOptions } from '@pastweb/tools/createAsyncStore/types';

const toolsMock = vi.hoisted(() => {
  const createAsyncStore = vi.fn((options: AsyncStoreOptions) => {
    let resolveReady!: (value: boolean) => void;

    const asyncStore = {
      options,
      isReady: new Promise<boolean>(resolve => {
        resolveReady = resolve;
      }),
      setStoreReady: vi.fn(() => {
        resolveReady(true);
      }),
    };

    return asyncStore;
  });
  const noop = vi.fn();

  return {
    createAsyncStore,
    noop,
  };
});

vi.mock('@pastweb/tools/createAsyncStore', () => ({
  createAsyncStore: toolsMock.createAsyncStore,
}));

vi.mock('@pastweb/tools/noop', () => ({
  noop: toolsMock.noop,
}));

const { createPiniaAsyncStore } = await import('../../src/createPiniaAsyncStore');

describe('createPiniaAsyncStore', () => {
  beforeEach(() => {
    toolsMock.createAsyncStore.mockClear();
    toolsMock.noop.mockClear();
  });

  it('creates a Pinia async store with a Pinia instance', () => {
    const asyncStore = createPiniaAsyncStore({
      name: 'app',
    });

    expect(asyncStore.store).toBeDefined();
    expect(typeof asyncStore.store.install).toBe('function');
    expect(typeof asyncStore.init).toBe('function');
    expect(toolsMock.createAsyncStore).toHaveBeenCalledWith({
      name: 'PiniaAsyncStore:app',
    });
  });

  it('uses the default async store name when no name is provided', () => {
    createPiniaAsyncStore({});

    expect(toolsMock.createAsyncStore).toHaveBeenCalledWith({
      name: 'PiniaAsyncStore',
    });
  });

  it('calls onInit with the Pinia instance during init', async () => {
    const onInit = vi.fn();
    const asyncStore = createPiniaAsyncStore({
      name: 'with-init',
      onInit,
    });

    await asyncStore.init();
    const isReady = await asyncStore.isReady;

    expect(onInit).toHaveBeenCalledTimes(1);
    expect(onInit).toHaveBeenCalledWith(asyncStore.store);
    expect(asyncStore.setStoreReady).toHaveBeenCalledTimes(1);
    expect(isReady).toBe(true);
  });

  it('uses noop when onInit is not provided', async () => {
    const asyncStore = createPiniaAsyncStore({});

    await asyncStore.init();

    expect(toolsMock.noop).toHaveBeenCalledTimes(1);
    expect(toolsMock.noop).toHaveBeenCalledWith(asyncStore.store);
    expect(asyncStore.setStoreReady).toHaveBeenCalledTimes(1);
  });
});
