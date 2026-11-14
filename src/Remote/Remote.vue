<script lang="ts">
  import { defineComponent, h, markRaw, shallowRef, toRaw, useAttrs } from 'vue';
  import type { PropType } from 'vue';
  import { Render, type Content } from '../Render';
  import { useBeforeMount } from '../useBeforeMount';
  import type { RemoteDependency, RemoteModule, RemoteProps } from './types';

  /**
   * Loads and renders a remote micro-frontend component.
   *
   * Dependencies are resolved before the remote module is imported. A
   * dependency or module-loading failure renders `errorFallback`. This stays
   * separate from `AsyncComponent` because remote-module resolution and future
   * server composition have distinct requirements.
   *
   * @example
   * ```ts
   * import { h } from 'vue';
   * import { Remote } from '@pastweb/vue';
   *
   * h(Remote, {
   *   component: () => import('billing/App'),
   *   dependency: () => import('billing/bootstrap'),
   *   fallback: 'Loading billing…',
   *   errorFallback: 'Billing is unavailable.',
   * });
   * ```
   */
  export default defineComponent({
    name: 'Remote',
    inheritAttrs: false,
    props: {
      component: {
        type: Function as PropType<RemoteProps['component']>,
        required: true,
      },
      dependency: {
        type: [Function, Array] as PropType<RemoteDependency | RemoteDependency[]>,
        default: undefined,
      },
      fallback: {
        type: [String, Number, Object, Function] as PropType<Content | null>,
        default: null,
      },
      errorFallback: {
        type: [String, Number, Object, Function] as PropType<Content | null>,
        default: null,
      },
    },
    setup(props) {
      const attrs = useAttrs();
      const LoadedComponent = shallowRef<RemoteModule['default'] | null>(null);
      const loadError = shallowRef<unknown>(null);

      async function loadRemote(): Promise<void> {
        const dependencies = props.dependency
          ? (Array.isArray(props.dependency) ? props.dependency : [props.dependency])
          : [];

        try {
          await Promise.all(dependencies.map(loadDependency => loadDependency()));
        } catch (error) {
          console.error('Remote dependency loading error:', error);
          loadError.value = error;
          return;
        }

        try {
          const module = await props.component();
          const component = module.default;

          if (!component) {
            throw new Error('Remote: No default export found');
          }

          LoadedComponent.value = markRaw(component);
        } catch (error) {
          console.error('Remote component loading error:', error);
          loadError.value = error;
        }
      }

      useBeforeMount(() => {
        void loadRemote();
      });

      function renderContent(content: Content | null) {
        if (content === null) return null;

        const normalized = typeof content === 'object'
          ? markRaw(toRaw(content))
          : content;

        return h(Render, {
          content: normalized,
          props: attrs,
        });
      }

      return () => {
        if (loadError.value) return renderContent(props.errorFallback);

        if (LoadedComponent.value) {
          return h(Render, {
            content: LoadedComponent.value,
            props: attrs,
          });
        }

        return renderContent(props.fallback);
      };
    },
  });
</script>
