<script lang="ts">
  import { defineComponent, h, onMounted, onUnmounted, shallowRef, useAttrs, watchEffect } from 'vue';
  import { isBrowser, isServer } from '@pastweb/tools/envs';
  import { isEntry } from '@pastweb/tools/createEntry';
  import { useIsland } from '../Island';
  import { renderServerEntryAdapter } from './utils';
  import type { PropType } from 'vue';
  import type { EntryAdapterProps, GenericEntry } from './types';

  /**
   * Vue bridge for mounting a Pastweb entry inside a Vue tree.
   *
   * On the client it mounts, updates, and unmounts the provided `entry`. During
   * SSR it can load a separate `ssrEntry` through the shared async task queue,
   * matching the React adapter behavior.
   */
  export default defineComponent({
    name: 'EntryAdapter',
    inheritAttrs: false,
    props: {
      entry: {
        type: Function as PropType<EntryAdapterProps['entry']>,
        required: true,
      },
      ssrEntry: {
        type: Function as PropType<EntryAdapterProps['ssrEntry']>,
        default: undefined,
      },
    },
    render() {
      return h('div', { style: { display: 'contents' } });
    },
    setup(props, { expose }) {
      const attrs = useAttrs();
      const entry = shallowRef<GenericEntry>(props.entry());
      const isMounted = shallowRef(false);
      const isIsland = useIsland();
      const ref = shallowRef<HTMLElement | null>(null);

      expose({ ref });

      if (isServer && !isBrowser) {
        return () => renderServerEntryAdapter(entry.value, props.ssrEntry, { ...attrs });
      }

      if (!isEntry(entry.value)) {
        throw Error('The entry must be generate via "createEntry" function.');
      }

      entry.value.mergeOptions({ initData: { ...attrs } });

      onMounted(() => {
        entry.value.setEntryElement(ref.value as HTMLElement);
        entry.value.emit('mount', isIsland);
        isMounted.value = true;
      });

      watchEffect(() => {
        if (isMounted.value) {
          entry.value.emit('update', { ...attrs });
        }
      });

      onUnmounted(() => {
        entry.value.emit('unmount');
        isMounted.value = false;
      });

      return () => h('div', { ref, style: { display: 'contents' } });
    },
  });
</script>
