import { isObject } from '@pastweb/tools/isObject';
import { noop } from '@pastweb/tools/noop';
import type { Dependency, DependencyInfo } from './types';

/**
 * Converts a dependency promise, factory, or dependency object into the
 * normalized object shape consumed by {@link loadDependency}.
 *
 * @param dependency - Dependency input to normalize.
 * @returns A dependency object with an export name.
 *
 * @example
 * ```ts
 * const dependency = normalizeDependency({
 *   dependency: () => import('./profileStore'),
 *   exportName: 'profileStore',
 * });
 * ```
 */
export function normalizeDependency(dependency: Dependency | DependencyInfo): DependencyInfo {
  if (isObject(dependency)) {
    const { exportName = 'default', ...rest } = dependency as DependencyInfo;

    return { exportName, ...rest } as DependencyInfo;
  }

  const depPromise = typeof dependency === 'function' ? dependency() : dependency;

  return { exportName: 'default', dependency: depPromise } as DependencyInfo;
}

/**
 * Loads a normalized dependency and returns the selected export.
 *
 * `onSuccess` receives the selected export. `onError` receives the thrown
 * error and the error is rethrown so callers can decide whether to continue.
 *
 * @param info - Normalized dependency information.
 * @returns The selected dependency export.
 *
 * @example
 * ```ts
 * const store = await loadDependency({
 *   dependency: () => import('./profileStore'),
 *   exportName: 'profileStore',
 * });
 * ```
 */
export async function loadDependency(info: DependencyInfo): Promise<any> {
  const {
    exportName,
    dependency,
    onSuccess = noop,
    onError = noop,
  } = info;
  const depPromise = typeof dependency === 'function' ? dependency() : dependency;

  try {
    const module = await Promise.resolve(depPromise);
    const result = module[exportName as string];

    onSuccess(result);

    return result;
  } catch(e) {
    (onError as any)(e);
    throw e;
  }
}
