<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { setContext } from '../setContext';
  import { withDefaultProps } from '../withDefaultProps';
  import { DEFAULT_PROPS, ISLAND_CONTEXT_KEY } from './constants';
  import type { IslandProps, IslandDefaultProps } from './types';

  const props = defineProps<IslandProps>();
  const p = withDefaultProps<IslandDefaultProps>(props, DEFAULT_PROPS);

  const emit = defineEmits<{(e: 'hydrated'): void}>();

  const islandRef = ref<HTMLElement | null>(null);
  const isHydrated = ref(false);
  let cleanup: (() => void) | null = null;

  setContext(ISLAND_CONTEXT_KEY, true);

  /**
   * Performs the actual hydration
   */
  function hydrate(): void {
    if (isHydrated.value) return;

    isHydrated.value = true;
    emit('hydrated');
    // In Vue we usually don't need explicit hydrateRoot like React.
    // Vue automatically handles hydration when the component is mounted
    // and the DOM matches what was rendered on server.
    // If you use teleport / suspense / etc., you may need extra logic.
  }

  /**
   * Cleanup function factory
   */
  const registerCleanup = (fn: () => void): void => { cleanup = fn };

  /**
   * Strategy: load
   */
  const hydrateImmediately = (): void => hydrate();

  /**
   * Strategy: idle
   */
  function hydrateOnIdle(): void {
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(hydrate, { timeout: p.idleTimeout });
      registerCleanup(() => window.cancelIdleCallback(handle));
    } else {
      // Fallback
      const timeoutId = setTimeout(hydrate, p.idleTimeout);
      registerCleanup(() => clearTimeout(timeoutId));
    }
  }

  /**
   * Strategy: visible
   */
  function hydrateWhenVisible(): void {
    if (!islandRef.value) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hydrate();
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(islandRef.value);
    registerCleanup(() => observer.disconnect());
  }

  /**
   * Strategy: media
   */
  function hydrateOnMedia(): void {
    if (!props.media) return;

    const mql = window.matchMedia(props.media);
    
    const checkAndHydrate = () => {
      if (mql.matches) {
        hydrate();
        mql.removeEventListener('change', checkAndHydrate);
      }
    }

    if (mql.matches) hydrate();
    else {
      mql.addEventListener('change', checkAndHydrate);
      registerCleanup(() => mql.removeEventListener('change', checkAndHydrate));
    }
  }

  onMounted(() => {
    if (p.client === 'none') return;

    switch (p.client) {
      case 'load':
        hydrateImmediately();
        break;
      case 'idle':
        hydrateOnIdle();
        break;
      case 'visible':
        hydrateWhenVisible();
        break;
      case 'media':
        hydrateOnMedia();
        break;
    }
  });

  onUnmounted(() => {
    if (cleanup) cleanup();
  });
</script>

<template>
  <div
    ref="islandRef"
    :data-island="true"
    :data-client="p.client"
    :data-media="p.media || undefined"
    :data-island-id="p.islandId"
    :style="{ display: 'contents' }"
  >
    <!-- 
      For client !== 'none': we render children normally on server
      and hydrate them later on client.
      
      suppressHydrationWarning equivalent is handled via data-* + logic
    -->
    <slot v-if="p.client !== 'none' || !isHydrated" />
    <slot name="fallback" v-if="p.client !== 'none' && !isHydrated" />
  </div>
</template>
