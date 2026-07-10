import { reactive } from 'vue';
import { createMatchDevice, type MatchDevice } from '@pastweb/tools';
import type { DevicesConfig, DevicesResult, MatchDevicesResult } from './types';

/**
 * Tracks device matches with the tools `createMatchDevice` helper.
 *
 * The returned `devices` object is stable and reactive, so it can be
 * destructured in Vue setup code and still update templates when media-query
 * matches change.
 *
 * @param config - Device match configuration.
 * @returns Current reactive device matches and a per-device match listener helper.
 *
 * @example
 * ```ts
 * const { devices, onMatch } = useMatchDevice({
 *   phone: { mediaQuery: '(max-width: 640px)' },
 * });
 *
 * useMounted(() => {
 *   onMatch('phone', matches => console.log(matches));
 * });
 * ```
 */
export function useMatchDevice(config: DevicesConfig): DevicesResult {
  const match: MatchDevice = createMatchDevice(config);
  const devices = reactive<MatchDevicesResult>(match.getDevices());

  match.onChange(nextDevices => {
    Object.keys(devices).forEach(deviceName => {
      if (!(deviceName in nextDevices)) {
        delete devices[deviceName];
      }
    });

    Object.assign(devices, nextDevices);
  });

  return Object.freeze({
    devices,
    onMatch: match.onMatch,
  });
}
