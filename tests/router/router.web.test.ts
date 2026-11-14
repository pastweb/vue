import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createViewRouter } from '@pastweb/tools/createViewRouter/createViewRouter';
import type { Route } from '@pastweb/tools/createViewRouter/types';
import {
  installRouter,
  RouterView,
  useLocation,
  useNavigate,
  usePaths,
  useRoute,
  useRouter,
  useRouterLink,
  useSearchParams,
} from '../../src/router';

function createHistory() {
  const listeners = new Set<() => void>();

  return {
    listen(fn: () => void) {
      listeners.add(fn);

      return () => listeners.delete(fn);
    },
    push(path: string) {
      window.history.pushState({}, '', path);
      listeners.forEach(fn => fn());
    },
    replace(path: string) {
      window.history.replaceState({}, '', path);
      listeners.forEach(fn => fn());
    },
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
  };
}

async function waitFor(assertion: () => void) {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 1000) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  throw lastError;
}

function createTestRouter(routes: Route[]) {
  const router = createViewRouter({
    history: createHistory() as any,
    RouterView,
    routes,
  });

  return router;
}

describe('router', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('installs the tools router and exposes it through useRouter', async () => {
    const router = createTestRouter([
      { path: '/', view: defineComponent({ setup: () => () => h('span', 'Home') }) },
    ]);
    await router.ready;
    const Probe = defineComponent({
      setup() {
        const activeRouter = useRouter();

        return () => h('span', activeRouter === router ? 'same' : 'different');
      },
    });

    const wrapper = mount(Probe, {
      global: {
        plugins: [installRouter(router)],
      },
    });

    expect(wrapper.text()).toBe('same');
  });

  it('updates useRoute, useLocation, usePaths, useRouterLink, and useSearchParams after navigation', async () => {
    const router = createTestRouter([
      { path: '/', view: defineComponent({ setup: () => () => h('span', 'Home') }) },
      { path: '/about', view: defineComponent({ setup: () => () => h('span', 'About') }) },
    ]);
    await router.ready;
    const Probe = defineComponent({
      setup() {
        const route = useRoute();
        const location = useLocation();
        const paths = usePaths();
        const link = useRouterLink({ path: '/about' });
        const search = useSearchParams();
        const navigate = useNavigate();

        return () => h('button', {
          onClick: () => navigate('/about?tab=info'),
        }, [
          route.path,
          '|',
          location.pathname,
          '|',
          String(paths.length),
          '|',
          String(link.isExactActive),
          '|',
          search.params.get('tab') || '',
        ].join(''));
      },
    });

    const wrapper = mount(Probe, {
      global: {
        plugins: [installRouter(router)],
      },
    });

    expect(wrapper.text()).toBe('/|/|2|false|');

    await wrapper.get('button').trigger('click');
    await nextTick();

    await waitFor(() => {
      expect(wrapper.text()).toBe('/about|/about|2|true|info');
    });
  });

  it('renders the selected RouterView component with route props', async () => {
    window.history.replaceState({}, '', '/user/42');
    const User = defineComponent({
      props: {
        title: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        return () => h('span', props.title);
      },
    });
    const router = createTestRouter([
      {
        path: '/user/:id',
        view: User,
        meta: {
          props: {
            title: 'Ada',
          },
        },
      },
    ]);
    await router.ready;

    const wrapper = mount(RouterView, {
      global: {
        plugins: [installRouter(router)],
      },
    });

    await waitFor(() => {
      expect(wrapper.text()).toBe('Ada');
    });
  });
});
