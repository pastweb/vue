import { reactive } from 'vue';
import { effect } from '@pastweb/tools/reactivity';
import type { DevicesResult, MatchDevicesResult } from './types';

/**
 * Reuses a tools `useMatchDevice` reactive state inside Vue rendering.
 *
 * The tools state is created outside Vue with `@pastweb/tools/useMatchDevice`.
 * `reuseMatchDevice` mirrors its device matches into a stable Vue-reactive
 * object, so setup destructuring remains renderable when the tools state
 * changes.
 *
 * @param matchDevice - Reactive `DevicesResult` returned by `@pastweb/tools/useMatchDevice`.
 * @returns Device result connected to Vue rendering.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMatchDevice as createToolsMatchDevice } from '@pastweb/tools';
 * import { reuseMatchDevice } from '@pastweb/vue';
 *
 * const deviceState = createToolsMatchDevice({
 *   phone: { mediaQuery: '(max-width: 640px)' },
 * });
 *
 * const { devices } = reuseMatchDevice(deviceState);
 * </script>
 *
 * <template>
 *   <MobileNav v-if="devices.phone" />
 *   <DesktopNav v-else />
 * </template>
 * ```
 */
export function reuseMatchDevice(matchDevice: DevicesResult): DevicesResult {
  const devices = reactive<MatchDevicesResult>({ ...matchDevice.devices });

  effect(
    () => {
      syncDevices(devices, matchDevice.devices);
    },
    () => [matchDevice.devices],
  );

  return Object.freeze({
    devices,
    onMatch: matchDevice.onMatch,
  });
}

function syncDevices(
  target: MatchDevicesResult,
  source: MatchDevicesResult,
): void {
  Object.keys(target).forEach(deviceName => {
    if (!(deviceName in source)) {
      delete target[deviceName];
    }
  });

  Object.assign(target, source);
}
