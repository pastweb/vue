<script setup lang="ts">
  import { reactive, onUnmounted } from 'vue';
  import { update } from '@pastweb/tools/update';
  import type { UpdateEntryProps } from './types';

  const props = defineProps<UpdateEntryProps>();
  const childProps = reactive({ ...props.childProps });

  const listener = props.on('update', props => {
    update(childProps, props);
  });

  onUnmounted(() => listener.removeListener());
</script>

<template>
  <component :is="props.component" v-bind="childProps" />
</template>
