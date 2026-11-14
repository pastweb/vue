import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import {
  PORTALS_CONTEXT_KEY,
  PORTAL_ANCHORS_CONTEXT_KEY,
  setAsPortalHandler,
  type PortalHandler,
} from '@pastweb/tools/portals';
import { WINDOW_MANAGER_CONTEXT_KEY, type WindowManager } from '@pastweb/tools';
import { setContext } from '../../src/setContext';
import {
  installPortals,
  Portal,
  usePortal,
  usePortalAnchors,
  usePortals,
} from '../../src/portals';
import { installWindowManager, useWindowManager } from '../../src/windowManager';

function createHandler(overrides: Partial<PortalHandler> = {}) {
  return setAsPortalHandler({
    id: false,
    getPortalElement: vi.fn(),
    portal: {} as PortalHandler['portal'],
    open: vi.fn(() => 'entry-1'),
    update: vi.fn(() => true),
    close: vi.fn(),
    remove: vi.fn(() => true),
    onRemove: vi.fn(),
    ...overrides,
  }) as PortalHandler;
}

describe('portals', () => {
  it('installs portal descriptors and anchor ids into Vue provide/inject', () => {
    const anchorsIds = {
      modal: 'modal-root',
    };
    const plugin = installPortals({
      anchorsIds,
      getEntry: vi.fn(),
    });
    const provided: Record<string, unknown> = {};

    plugin.install({
      provide(key: string, value: unknown) {
        provided[key] = value;
      },
    } as any);

    expect(provided[PORTAL_ANCHORS_CONTEXT_KEY]).toBe(anchorsIds);
    expect(typeof (provided[PORTALS_CONTEXT_KEY] as Record<string, unknown>).modal).toBe('function');
  });

  it('reads portal descriptors and anchor ids through composables', () => {
    const anchorsIds = {
      modal: 'modal-root',
    };
    const portals = {
      modal: vi.fn(),
    };
    const Probe = defineComponent({
      setup() {
        const anchors = usePortalAnchors<typeof anchorsIds>();
        const activePortals = usePortals<typeof portals>();

        return () => h('span', `${anchors.modal}:${activePortals.modal === portals.modal}`);
      },
    });
    const Root = defineComponent({
      setup() {
        setContext(PORTAL_ANCHORS_CONTEXT_KEY, anchorsIds);
        setContext(PORTALS_CONTEXT_KEY, portals);

        return () => h(Probe);
      },
    });

    const wrapper = mount(Root);

    expect(wrapper.text()).toBe('modal-root:true');
  });

  it('queues usePortal calls until Portal binds the installed handler', async () => {
    const open = vi.fn(() => 'entry-1');
    const handler = createHandler({ open });
    const createHandlerForPortal = vi.fn(() => handler);
    const Root = defineComponent({
      setup() {
        setContext(PORTALS_CONTEXT_KEY, {
          modal: createHandlerForPortal,
        });

        const portal = usePortal();
        portal.open();

        return () => h(Portal, { path: 'modal', use: portal }, {
          default: () => h('span', 'Dialog'),
        });
      },
    });

    mount(Root);

    await vi.waitFor(() => {
      expect(createHandlerForPortal).toHaveBeenCalled();
      expect(open).toHaveBeenCalled();
    });
  });

  it('forwards update, close, and remove to the active portal handler', async () => {
    const update = vi.fn(() => true);
    const close = vi.fn();
    const remove = vi.fn(() => true);
    const handler = createHandler({ update, close, remove });
    let portal!: ReturnType<typeof usePortal>;
    const Root = defineComponent({
      setup() {
        setContext(PORTALS_CONTEXT_KEY, {
          modal: vi.fn(() => handler),
        });

        portal = usePortal();

        return () => h(Portal, { path: 'modal', use: portal }, {
          default: () => h('span', 'Dialog'),
        });
      },
    });

    mount(Root);
    portal.open();

    await vi.waitFor(() => {
      expect(handler.open).toHaveBeenCalled();
    });

    expect(portal.update({ title: 'Updated' })).toBe(true);
    portal.close();
    expect(portal.remove()).toBe(true);

    expect(update).toHaveBeenCalledWith({ title: 'Updated' });
    expect(close).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it('given a managed portal, when it is removed, then it unregisters its window entry', async () => {
    const close = vi.fn();
    let notifyRemoved!: () => void;
    const handler = createHandler({
      close,
      onRemove: vi.fn(callback => { notifyRemoved = callback; }),
    });
    const createHandlerForPortal = vi.fn(() => handler);
    const register = vi.fn();
    const unregister = vi.fn();
    const manager = {
      register,
      unregister,
    } as unknown as WindowManager;
    let portal!: ReturnType<typeof usePortal>;
    const Root = defineComponent({
      setup() {
        setContext(PORTALS_CONTEXT_KEY, { modal: createHandlerForPortal });
        portal = usePortal();

        return () => h(Portal, { manager, path: 'modal', use: portal }, {
          default: () => h('span', 'Dialog'),
        });
      },
    });

    mount(Root);
    portal.open();
    portal.open();

    await vi.waitFor(() => expect(register).toHaveBeenCalledWith({
      id: 'entry-1',
      requestClose: expect.any(Function),
    }));

    expect(createHandlerForPortal).toHaveBeenCalledTimes(1);
    const component = createHandlerForPortal.mock.calls[0][0] as { props?: Record<string, unknown> };
    expect(component.props?.manager).toBe(manager);

    const registration = register.mock.calls[0][0];
    registration.requestClose?.();
    notifyRemoved();

    expect(close).toHaveBeenCalled();
    expect(unregister).toHaveBeenCalledWith('entry-1');
    expect(portal.id).toBe(false);
  });

  it('given an installed manager, when consumed in setup, then it returns the shared instance', () => {
    const manager = {} as WindowManager;
    const Probe = defineComponent({
      setup() {
        const resolved = useWindowManager();
        return () => h('span', resolved === manager ? 'available' : 'missing');
      },
    });
    const Root = defineComponent({
      setup() {
        setContext(WINDOW_MANAGER_CONTEXT_KEY, manager);
        return () => h(Probe);
      },
    });

    expect(mount(Root).text()).toBe('available');
  });

  it('given a window manager, when installed, then it provides the shared context value', () => {
    const manager = {} as WindowManager;
    const provided: Record<string, unknown> = {};

    installWindowManager({ manager }).install({
      provide(key: string, value: unknown) {
        provided[key] = value;
      },
    } as any);

    expect(provided[WINDOW_MANAGER_CONTEXT_KEY]).toBe(manager);
  });
});
