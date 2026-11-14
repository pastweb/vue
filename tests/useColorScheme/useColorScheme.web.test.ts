import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = () => void;

function createMockMatchScheme(initial = { selected: 'auto', system: 'light' }) {
  let info = { ...initial };
  const modeListeners = new Set<Listener>();
  const systemListeners = new Set<Listener>();
  const matchScheme = {
    getInfo: vi.fn(() => ({ ...info })),
    setMode: vi.fn((mode: string) => {
      info = { ...info, selected: mode };
      modeListeners.forEach(listener => listener());
    }),
    onModeChange: vi.fn((listener: Listener) => {
      modeListeners.add(listener);

      return {
        removeListener: vi.fn(() => modeListeners.delete(listener)),
      };
    }),
    onSysSchemeChange: vi.fn((listener: Listener) => {
      systemListeners.add(listener);

      return {
        removeListener: vi.fn(() => systemListeners.delete(listener)),
      };
    }),
    setSystem(system: string) {
      info = { ...info, system };
      systemListeners.forEach(listener => listener());
    },
  };

  return matchScheme;
}

const toolsMock = vi.hoisted(() => {
  const update = vi.fn((target: Record<string, unknown>, value: Record<string, unknown>) => {
    Object.assign(target, value);
    return target;
  });
  const createMatchScheme = vi.fn(() => createMockMatchScheme());

  return {
    createMatchScheme,
    update,
  };
});

vi.mock('@pastweb/tools', () => ({
  createMatchScheme: toolsMock.createMatchScheme,
  update: toolsMock.update,
}));

const { reuseColorScheme, useColorScheme } = await import('../../src/useColorScheme');

describe('useColorScheme', () => {
  beforeEach(() => {
    toolsMock.createMatchScheme.mockClear();
    toolsMock.update.mockClear();
  });

  it('creates a composable from a shared match scheme', () => {
    expect(typeof reuseColorScheme(createMockMatchScheme() as any)).toBe('function');
  });

  it('returns current scheme and setMode function', () => {
    const Probe = defineComponent({
      setup() {
        const [scheme, setMode] = useColorScheme();

        return () => h('button', { onClick: () => setMode('dark') }, scheme.selected);
      },
    });

    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('auto');
    expect(toolsMock.createMatchScheme).toHaveBeenCalledWith({});
  });

  it('creates an internal match scheme from options when none is provided', () => {
    const Probe = defineComponent({
      setup() {
        const [scheme] = useColorScheme({ defaultMode: 'auto' });

        return () => h('span', scheme.selected);
      },
    });

    mount(Probe);

    expect(toolsMock.createMatchScheme).toHaveBeenCalledWith({ defaultMode: 'auto' });
  });

  it('updates state when mode changes', async () => {
    const matchScheme = createMockMatchScheme();
    const useSharedColorScheme = reuseColorScheme(matchScheme as any);
    const Probe = defineComponent({
      setup() {
        const [scheme, setMode] = useSharedColorScheme();

        return () => h('button', { onClick: () => setMode('dark') }, scheme.selected);
      },
    });

    const wrapper = mount(Probe);

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.text()).toBe('dark');
  });

  it('updates state when system scheme changes', async () => {
    const matchScheme = createMockMatchScheme();
    const useSharedColorScheme = reuseColorScheme(matchScheme as any);
    const Probe = defineComponent({
      setup() {
        const [scheme] = useSharedColorScheme();

        return () => h('span', scheme.system);
      },
    });

    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('light');

    matchScheme.setSystem('dark');
    await nextTick();

    expect(wrapper.text()).toBe('dark');
  });

  it('cleans up listeners before unmount', () => {
    const removeModeListener = vi.fn();
    const removeSysListener = vi.fn();
    const matchScheme = {
      ...createMockMatchScheme(),
      onModeChange: vi.fn(() => ({ removeListener: removeModeListener })),
      onSysSchemeChange: vi.fn(() => ({ removeListener: removeSysListener })),
    };
    const useSharedColorScheme = reuseColorScheme(matchScheme as any);
    const Probe = defineComponent({
      setup() {
        useSharedColorScheme();

        return () => h('span', 'theme');
      },
    });

    const wrapper = mount(Probe);

    wrapper.unmount();

    expect(removeModeListener).toHaveBeenCalledTimes(1);
    expect(removeSysListener).toHaveBeenCalledTimes(1);
  });

  it('keeps shared match scheme instances in sync', async () => {
    const matchScheme = createMockMatchScheme();
    const useSharedColorScheme = reuseColorScheme(matchScheme as any);
    const Probe = defineComponent({
      props: {
        label: String,
      },
      setup(props) {
        const [scheme, setMode] = useSharedColorScheme();

        return () => h('button', { onClick: () => setMode('light') }, `${props.label}:${scheme.selected}`);
      },
    });

    const first = mount(Probe, { props: { label: 'first' } });
    const second = mount(Probe, { props: { label: 'second' } });

    await first.get('button').trigger('click');
    await nextTick();

    expect(first.text()).toBe('first:light');
    expect(second.text()).toBe('second:light');
  });
});
