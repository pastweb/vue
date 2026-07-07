import { update } from '@pastweb/tools/update';

/**
 * Synchronizes a mutable record with a source object.
 *
 * Keys missing from the source are removed from the target, then remaining
 * values are merged with the shared tools `update` helper.
 *
 * @param target - Mutable record to update in place.
 * @param source - Source values that should remain on the target.
 */
export function syncRecord(target: Record<string, any>, source: Record<string, any>): void {
  Object.keys(target).forEach(key => {
    if (!(key in source)) delete target[key];
  });

  update(target, source);
}
