<script setup lang="ts">
  import { shallowReactive, watch } from 'vue';
  import { ROUTE_DEPTH_CONTEXT_KEY } from '@pastweb/tools/createViewRouter/constants';
  import { routeDive } from '@pastweb/tools/createViewRouter/utils/routeDive';
  import { useMounted } from '../../useMounted';
  import { getContext } from '../../getContext';
  import { setContext } from '../../setContext';
  import { useRouter } from '../useRouter';
  import { useRoute } from '../useRoute';
  import type { RouterViewProps, RouterViewState } from './types';

  const props = defineProps<RouterViewProps>();
  
  const state = shallowReactive<RouterViewState>({
    component: null,
    props: {},
  });
  
  const router = useRouter();
  const route = useRoute();
  const depth = getContext<number>(ROUTE_DEPTH_CONTEXT_KEY) + 1;

  setContext(ROUTE_DEPTH_CONTEXT_KEY, depth);

  async function loadComponent() {
    const { meta, views } = routeDive(route, depth);
    const { name = 'default' } = props;
    let view = views[name];
    
    if (view) {
      if (typeof view === 'function') {
        state.component = router.preloader || null;
        view = await view().default;
      }
    
      state.component = view;
      state.props = meta.props || {};
    }
  }

  useMounted(() => {
    const { preloader } = router;
    state.component = preloader || null;

    loadComponent();
  });

  watch(route, () => loadComponent());
</script>

<template>
  <component :is="state.component" v-bind="state.props" />
</template>
