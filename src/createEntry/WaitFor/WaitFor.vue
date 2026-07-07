<script setup lang="ts">
  import { shallowReactive, onMounted } from 'vue';
  import { normalizeAsyncQueue } from '@pastweb/tools/createAsyncStore/normalizeAsyncQueue';
  import type { WaitForProps } from './types';

  const props = defineProps<WaitForProps>();
  const { wait } = props;
  const state = shallowReactive({ isLoading: true });

  const queue = normalizeAsyncQueue(wait);
  onMounted(async () => {
    try {
      await Promise.all(queue);

      state.isLoading = false;
    } catch (e) {
      throw e;
    }
  });
</script>

<template>
  <component
    :is="state.isLoading ? props.fallback : props.component"
    v-bind="props.childProps"
  />
</template>
