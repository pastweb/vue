<script lang="ts">
  import { defineComponent, h, markRaw, shallowRef, toRaw, useAttrs } from 'vue';
  import type { PropType } from 'vue';
  import { isBrowser, isServer } from '@pastweb/tools/envs';
  import { registerAsyncTask } from '@pastweb/tools/ssrUtils/asyncTasks';
  import { Render, type Content } from '../Render';
  import { useBeforeMount } from '../useBeforeMount';
  import { PRELOADED_ON_SERVER } from './constants';
  import { loadDependency, normalizeDependency } from './utils';
  import type { AsyncComponentProps, ComponentModule, Dependency } from './types';

  /**
   * Loads dependencies and a dynamic Vue component before rendering it.
   *
   * On the server the first render pass registers async work and returns
   * nothing. After the SSR async task queue resolves, the next render pass uses
   * the preloaded component and forwards attrs as component props.
   *
   * @example
   * ```ts
   * import { h } from 'vue';
   * import { AsyncComponent } from '@pastweb/vue';
   * import LoadingPanel from './LoadingPanel.vue';
   *
   * h(AsyncComponent, {
   *   component: () => import('./ProfilePanel.vue'),
   *   dependencies: [() => import('./profileStore')],
   *   fallback: LoadingPanel,
   * });
   * ```
   */
  export default defineComponent({
    name: 'AsyncComponent',
    inheritAttrs: false,
    props: {
      /** Dynamic import or loader resolving a default Vue component export. */
      component: {
        type: Function as PropType<AsyncComponentProps['component']>,
        required: true,
      },
      /** Optional dependencies loaded before the component is rendered. */
      dependencies: {
        type: Array as PropType<Dependency[]>,
        default: undefined,
      },
      /** Content rendered while the async component is loading on the client. */
      fallback: {
        type: [String, Number, Object, Function] as PropType<Content | null>,
        default: null,
      },
    },
    setup(props) {
      const attrs = useAttrs();

      if (isServer && !isBrowser) {
        return () => serverSide(props, attrs);
      }

      const LoadedComponent = shallowRef<ComponentModule['default'] | null>(null);

      async function loadComponent(): Promise<void> {
        try {
          const module = await props.component();
          const Comp = module.default as ComponentModule['default'] | undefined;

          if (!Comp) {
            console.error('AsyncComponent: No default export found');
            return;
          }

          LoadedComponent.value = markRaw(Comp);
        } catch(e) {
          console.error(e);
        }
      }

      async function loadDependencies(): Promise<void> {
        const dependencies = props.dependencies;

        if (dependencies && dependencies.length > 0) {
          await Promise.all(
            dependencies.map(async (dep, index) => {
              try {
                await loadDependency(normalizeDependency(dep));
              } catch(e) {
                console.error(`the dependency with the index ${index} has an error:`, e);
              }
            })
          );
        }

        await loadComponent();
      }

      useBeforeMount(() => {
        void loadDependencies();
      });

      return () => {
        if (LoadedComponent.value) {
          return h(Render, {
            content: LoadedComponent.value,
            props: attrs,
          });
        }

        if (props.fallback) {
          const fallback = typeof props.fallback === 'object'
            ? markRaw(toRaw(props.fallback))
            : props.fallback;

          return h(Render, {
            content: fallback,
            props: attrs,
          });
        }

        return null;
      };
    },
  });

  function serverSide(
    props: Readonly<AsyncComponentProps>,
    attrs: Record<string, unknown>
  ) {
    const Preloaded = PRELOADED_ON_SERVER.get(props.component);

    if (Preloaded) {
      return h(Render, {
        content: Preloaded,
        props: attrs,
      });
    }

    registerAsyncTask(async () => {
      const dependencies = props.dependencies || [];

      if (dependencies.length > 0) {
        await Promise.all(
          dependencies.map(async (dep, index) => {
            try {
              await loadDependency(normalizeDependency(dep));
            } catch(e) {
              console.error(`dependency ${index} failed:`, e);
            }
          })
        );
      }

      const module = await props.component();
      const Comp = module.default as ComponentModule['default'] | undefined;

      if (!Comp) {
        console.error('AsyncComponent: No default export found');
        return;
      }

      PRELOADED_ON_SERVER.set(props.component, markRaw(Comp));
    });

    return null;
  }
</script>
