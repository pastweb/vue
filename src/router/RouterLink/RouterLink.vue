<script setup lang="ts">
  import { useRef } from '../../useRef';
  import { useRouterLink } from '../useRouterLink';
  import type { RouterLinkProps } from './types';

  const props = defineProps<RouterLinkProps>();
  const link = useRouterLink(props);
  const ref = useRef<HTMLElement | null>(null);

  defineExpose({ ref });

  function onClick(e: MouseEvent) {
    e.preventDefault();
    if (!props.preventNavigate) link.navigate();
  }
</script>

<template>
  <a ref="ref" :href="link.pathname" :class="props.className" @click="onClick">
    <slot />
  </a>
</template>
