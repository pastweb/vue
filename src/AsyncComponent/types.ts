import type { Component } from 'vue';
import type { Content } from '../Render';

/**
 * Information used to load and optionally handle one async dependency.
 *
 * @example
 * ```ts
 * const dependency: DependencyInfo = {
 *   dependency: () => import('./profileStore'),
 *   exportName: 'profileStore',
 *   onSuccess: store => registerStore('profile', store),
 * };
 * ```
 */
export interface DependencyInfo {
  /** Export name read from the resolved dependency module. Defaults to `default`. */
  exportName?: string;

  /** Promise or factory that resolves the dependency module. */
  dependency: Promise<any> | (() => Promise<any>);

  /** Called with the selected export when the dependency resolves. */
  onSuccess?: (dependency: any) => void;

  /** Called with the thrown error when the dependency fails. */
  onError?: (error: any) => void;
}

/**
 * Module shape expected from an async Vue component import.
 *
 * @example
 * ```ts
 * const module: ComponentModule = await import('./ProfilePanel.vue');
 * ```
 */
export interface ComponentModule {
  /** Vue component exported as the module default. */
  default: Component;
}

/**
 * Dependency input accepted by {@link AsyncComponent}.
 *
 * @example
 * ```ts
 * const dependency: Dependency = () => import('./profileStore');
 * ```
 */
export type Dependency = Promise<any> | (() => Promise<any>) | DependencyInfo;

/**
 * Props for the Vue {@link AsyncComponent}.
 *
 * @example
 * ```ts
 * const props: AsyncComponentProps = {
 *   component: () => import('./ProfilePanel.vue'),
 *   dependencies: [() => import('./profileStore')],
 * };
 * ```
 */
export interface AsyncComponentProps {
  /** Dynamic import or loader that resolves a module with a default Vue component. */
  component: () => Promise<ComponentModule | any>;

  /** Dependencies loaded before the component is rendered. */
  dependencies?: Dependency[];

  /** Content rendered while the component and dependencies are loading. */
  fallback?: Content | null;
}
