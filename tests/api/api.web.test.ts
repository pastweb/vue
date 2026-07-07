import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { QUERY_CACHE_CONTEXT_KEY } from '@pastweb/tools/api/createQueryCache/constants';
import { reactive } from '@pastweb/tools/reactivity';
import {
  installApiCache,
  reuseMutation,
  reuseQuery,
  useApiQueryCache,
  useQuery,
} from '../../src/api';
import type { QueryResponse } from '@pastweb/tools/api/createApiAgent/types';
import type { QueryCache } from '@pastweb/tools/api/createQueryCache/types';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });

  return { promise, resolve };
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

describe('Vue API composables', () => {
  it('exports reuseMutation as the same implementation as reuseQuery', () => {
    expect(reuseMutation).toBe(reuseQuery);
  });

  it('installs and reads the query cache from Vue provide/inject', () => {
    const queryCache = {
      getDehydrateScriptID: () => '__TEST__',
    } as QueryCache;

    const Probe = defineComponent({
      setup() {
        const cache = useApiQueryCache();

        return () => h('span', cache.getDehydrateScriptID());
      },
    });

    const wrapper = mount(Probe, {
      global: {
        plugins: [installApiCache({ queryCache })],
      },
    });

    expect(wrapper.text()).toBe('__TEST__');
  });

  it('provides the cache under the tools query cache context key', () => {
    const queryCache = {} as QueryCache;
    const plugin = installApiCache({ queryCache });
    const provided: Record<string, unknown> = {};

    plugin.install({
      provide(key: string, value: unknown) {
        provided[key] = value;
      },
    } as any);

    expect(provided[QUERY_CACHE_CONTEXT_KEY]).toBe(queryCache);
  });

  it('reuses a tools reactive state and rerenders when its first-shape fields change', async () => {
    const Counter = defineComponent({
      setup() {
        const state = reuseQuery(() => {
          const nextState = reactive({
            count: 0,
            increment() {
              nextState.count += 1;
            },
          });

          return nextState;
        });

        return () => h('button', { onClick: state.increment }, state.count);
      },
    });

    const wrapper = mount(Counter);

    expect(wrapper.text()).toBe('0');

    await wrapper.get('button').trigger('click');

    await waitFor(() => {
      expect(wrapper.text()).toBe('1');
    });
  });

  it('wraps tools useQuery and rerenders when query data resolves', async () => {
    const deferred = createDeferred<QueryResponse<{ name: string }>>();

    const User = defineComponent({
      setup() {
        const query = useQuery({
          fn: () => deferred.promise,
        });

        return () => h('span', query.data?.name ?? 'Loading');
      },
    });

    const wrapper = mount(User);

    expect(wrapper.text()).toBe('Loading');

    deferred.resolve({
      data: { name: 'Ada' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as QueryResponse<{ name: string }>);

    await waitFor(() => {
      expect(wrapper.text()).toBe('Ada');
    });
  });
});
