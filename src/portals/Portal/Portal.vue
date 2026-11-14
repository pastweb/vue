<script setup lang="ts">
  import { cloneVNode, watchEffect } from 'vue';
  import { isPortalHandler, select } from '@pastweb/tools';
  import type { PortalHandler } from '@pastweb/tools';
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
  const slots = defineSlots<{ default?: () => any[] }>();

  function getComponent() {
    const component = slots.default?.()[0] ?? null;
    return component && props.manager ? cloneVNode(component, { manager: props.manager }) : component;
  }

  watchEffect(() => {
    const { manager, path, use } = props;

    use.open = () => {
      if (entryId.value) return entryId.value;

      const createHandler = select(portals, path);
      handler.value = createHandler(getComponent());
      const activeHandler = handler.value as PortalHandler;
      let openedId: string | false = false;

      activeHandler.onRemove(() => {
        if (openedId && manager) manager.unregister(openedId);
        use.id = false;
        entryId.value = false;
      });

      use.update = activeHandler.update;
      use.close = () => activeHandler.close();
      use.remove = () => activeHandler.remove();

      const id = activeHandler.open();
      openedId = id;
      use.id = id;
      entryId.value = id;

      if (id && manager) {
        manager.register({
          id,
          requestClose: () => activeHandler.close(),
        });
      }

      return id;
    };

    use.isReady();
  });
</script>

<template />
  
