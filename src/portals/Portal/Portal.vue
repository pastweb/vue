<script setup lang="ts">
  import { watchEffect, h, useSlots } from 'vue';
  import { isPortalHandler, type PortalHandler } from '@pastweb/tools/portals';
  import { select } from '@pastweb/tools/select';
  import { useRef } from '../../useRef';
  import { usePortals } from '../usePortals';
  import type { PortalProps, Portals } from './types';

  const props = defineProps<PortalProps>();

  if (!isPortalHandler(props.use)) {
    throw Error('Portal error - the "use" property must be a PortalHandler Object.');
  }

  const portals = usePortals() as Portals;
  const entryId = useRef<string | false>(false);
  const handler = useRef<PortalHandler | null>(null);
  const slots = useSlots();

  watchEffect(() => {
    const { path, use } = props;
    const component = h((slots as any).default()[0]);

    use.open = () => {
      const createHandler = select(portals, path);
      handler.value = createHandler(component);
      const h = handler.value as PortalHandler;

      h.onRemove(() => {
        use.id = false;
        entryId.value = false;
      });

      use.update = h.update;
      use.close = () => h.close();
      use.remove = () => h.remove();

      const id = h.open();
      use.id = id;
      entryId.value = id;

      return id;
    };

    use.isReady();
  });
</script>

<template />
  
