import { onBeforeUnmount, shallowReactive as vueReactive, watchEffect, type WatchHandle } from 'vue';
import { getFunctionSignature } from '@pastweb/tools/getFunctionSignature';
import { createMediatorContextUtils } from '@pastweb/tools/globalContext/createMediatorContextUtils';
import { isHMREnabled } from '@pastweb/tools/isHMREnabled';
import { effect, reactive } from '@pastweb/tools/reactivity';
import { update } from '@pastweb/tools/update';
import { getContext } from '../getContext';
import { setContext } from '../setContext';
import { syncRecord } from './utils';
import type { ContextUtils, Extras, Mediator, MediatorFunction, Props } from './types';

/**
 * Creates a tools mediator inside a Vue component.
 *
 * The mediator is created once for the component instance. Props and extras are
 * copied into tools reactive objects and kept in sync with Vue updates, while
 * mediator state is mirrored into Vue shallow reactivity for rendering.
 *
 * Vue does not need React's render-time mediator store because `setup()` runs
 * once per component instance. This hook still keeps an instance-local store so
 * mediator state persists across prop updates and Vue watchers are stopped on
 * unmount. During development HMR, a changed mediator source signature
 * reinitializes the mediator in place and refreshes the Vue state mirror.
 *
 * @typeParam T - Mediator return type.
 * @param mediator - Tools mediator factory.
 * @param props - Props passed to the mediator. `children` is ignored.
 * @param extras - Extra values passed to the mediator.
 * @returns Mediator return value with Vue-rendered state.
 *
 * @example
 * counterMediator.ts
 *
 * ```ts
 * import { reactive } from '@pastweb/tools';
 *
 * export function createCounter(props: { initial: number }) {
 *   const state = reactive({ count: props.initial });
 *
 *   return {
 *     state,
 *     increment: () => {
 *       state.count += 1;
 *     },
 *   };
 * }
 * ```
 *
 * CounterButton.vue
 *
 * ```vue
 * <script setup lang="ts">
 * import { useMediator } from '@pastweb/vue';
 * import { createCounter } from './counterMediator';
 *
 * const counter = useMediator(createCounter, { initial: 0 });
 * </script>
 *
 * <template>
 *   <button @click="counter.increment">
 *     {{ counter.state.count }}
 *   </button>
 * </template>
 * ```
 */
export const useMediator = <T>(mediator: MediatorFunction<T>, props: Props = {}, extras: Extras = {}): T => {
  const { children: _children, ...restProps } = props;
  const stops = new Set<WatchHandle>();
  const hmr = isHMREnabled();
  let isDisposed = false;
  let activeGeneration = 0;
  let storedMediator = mediator;
  let storedMediatorSignature = getFunctionSignature(storedMediator);

  const storedProps = reactive({ ...restProps });
  const storedExtras = reactive({ ...extras });
  const contextUtils: ContextUtils = {
    getContext,
    setContext,
  };
  let mediatorResult = createMediator();
  const state: Record<string, any> = vueReactive({ ...(mediatorResult.state || {}) });
  const output = { ...mediatorResult, state } as Mediator & Record<string, any>;

  function createMediator(): Mediator & Record<string, any> {
    return createMediatorContextUtils(
      storedMediator,
      storedProps,
      storedExtras,
      contextUtils,
    ) as Mediator & Record<string, any>;
  }

  function syncOutput(): void {
    Object.keys(output).forEach(key => {
      if (key !== 'state' && !(key in mediatorResult)) delete output[key];
    });

    Object.entries(mediatorResult).forEach(([key, value]) => {
      if (key !== 'state') output[key] = value;
    });
  }

  function bridgeState(): void {
    const generation = ++activeGeneration;

    syncRecord(state, mediatorResult.state || {});

    if (mediatorResult.state) {
      effect(() => {
        if (!isDisposed && generation === activeGeneration && mediatorResult.state) {
          update(state, mediatorResult.state);
        }
      }, mediatorResult.state);
    }
  }

  function reinitializeMediator(nextMediator: MediatorFunction<T>): void {
    storedMediator = nextMediator;
    storedMediatorSignature = getFunctionSignature(storedMediator);
    mediatorResult = createMediator();

    syncOutput();
    bridgeState();
  }

  syncOutput();
  bridgeState();

  stops.add(watchEffect(() => {
    const { children: _children, ...nextProps } = props;
    syncRecord(storedProps, nextProps);

    if (hmr) {
      const nextSignature = getFunctionSignature(mediator);

      if (storedMediatorSignature !== nextSignature) {
        reinitializeMediator(mediator);
      }
    }
  }));

  stops.add(watchEffect(() => {
    syncRecord(storedExtras, extras);
  }));

  onBeforeUnmount(() => {
    isDisposed = true;
    activeGeneration += 1;
    stops.forEach(stop => stop());
    stops.clear();
  });

  return output as T;
}
