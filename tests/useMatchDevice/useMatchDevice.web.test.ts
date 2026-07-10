import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MatchDevicesResult } from '@pastweb/tools';
import { reactive } from '@pastweb/tools/reactivity';

const matchDeviceMock = vi.hoisted(() => {
  let devices: MatchDevicesResult = {};
  let onChangeListener: (devices: MatchDevicesResult) => void = () => undefined;
  const onMatch = vi.fn();
  const createMatchDevice = vi.fn(() => ({
    getDevices: vi.fn(() => ({ ...devices })),
    onChange: vi.fn((listener: (devices: MatchDevicesResult) => void) => {
      onChangeListener = listener;
    }),
    onMatch,
  }));

  return {
    createMatchDevice,
    emitChange(nextDevices: MatchDevicesResult) {
      devices = { ...nextDevices };
      onChangeListener({ ...nextDevices });
    },
    onMatch,
    setDevices(nextDevices: MatchDevicesResult) {
      devices = { ...nextDevices };
    },
    reset() {
      devices = {};
      onChangeListener = () => undefined;
      createMatchDevice.mockClear();
      onMatch.mockClear();
    },
  };
});

vi.mock('@pastweb/tools', async importOriginal => ({
  ...await importOriginal<typeof import('@pastweb/tools')>(),
  createMatchDevice: matchDeviceMock.createMatchDevice,
}));

const { reuseMatchDevice, useMatchDevice } = await import('../../src/useMatchDevice');

async function waitFor(assertion: () => void): Promise<void> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 1000) {
    try {
      assertion();
      return;
    } catch(error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  throw lastError;
}

describe('useMatchDevice', () => {
  beforeEach(() => {
    matchDeviceMock.reset();
  });

  it('given a device config, when mounted, then it returns the current device matches', () => {
    matchDeviceMock.setDevices({ phone: false });
    const Probe = defineComponent({
      setup() {
        const { devices } = useMatchDevice({
          phone: { mediaQuery: '(max-width: 640px)' },
        });

        return () => h('span', devices.phone ? 'phone' : 'desktop');
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('desktop');
    expect(matchDeviceMock.createMatchDevice).toHaveBeenCalledWith({
      phone: { mediaQuery: '(max-width: 640px)' },
    });
  });

  it('given a device change, when the matcher updates, then the destructured devices object stays reactive', async () => {
    matchDeviceMock.setDevices({ phone: false });
    const Probe = defineComponent({
      setup() {
        const { devices } = useMatchDevice({
          phone: { mediaQuery: '(max-width: 640px)' },
        });

        return () => h('span', devices.phone ? 'phone' : 'desktop');
      },
    });
    const wrapper = mount(Probe);

    matchDeviceMock.emitChange({ phone: true });
    await nextTick();

    expect(wrapper.text()).toBe('phone');
  });

  it('given a removed device key, when the matcher updates, then it removes the stale match', async () => {
    matchDeviceMock.setDevices({ phone: true, tablet: true });
    const Probe = defineComponent({
      setup() {
        const { devices } = useMatchDevice({
          phone: { mediaQuery: '(max-width: 640px)' },
          tablet: { mediaQuery: '(max-width: 900px)' },
        });

        return () => h('span', devices.tablet ? 'tablet' : 'none');
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('tablet');

    matchDeviceMock.emitChange({ phone: true });
    await nextTick();

    expect(wrapper.text()).toBe('none');
  });

  it('given onMatch, when called, then it forwards to the matcher listener', () => {
    const listener = vi.fn();
    const Probe = defineComponent({
      setup() {
        const { onMatch } = useMatchDevice({
          phone: { mediaQuery: '(max-width: 640px)' },
        });

        onMatch('phone', listener);

        return () => h('span', 'ready');
      },
    });

    mount(Probe);

    expect(matchDeviceMock.onMatch).toHaveBeenCalledWith('phone', listener);
  });

  it('given a tools device state, when reuseMatchDevice renders, then it rerenders on device changes', async () => {
    const deviceState = reactive({
      devices: {
        phone: false,
      },
      onMatch: vi.fn(),
    });
    const Probe = defineComponent({
      setup() {
        const { devices } = reuseMatchDevice(deviceState);

        return () => h('span', devices.phone ? 'phone' : 'desktop');
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('desktop');

    deviceState.devices = { phone: true };

    await waitFor(() => {
      expect(wrapper.text()).toBe('phone');
    });
  });

  it('given a tools device state, when reuseMatchDevice onMatch is called, then it forwards the listener', () => {
    const onMatch = vi.fn();
    const listener = vi.fn();
    const deviceState = reactive({
      devices: {
        phone: false,
      },
      onMatch,
    });
    const Probe = defineComponent({
      setup() {
        const { onMatch } = reuseMatchDevice(deviceState);

        onMatch('phone', listener);

        return () => h('span', 'ready');
      },
    });

    mount(Probe);

    expect(onMatch).toHaveBeenCalledWith('phone', listener);
  });
});
