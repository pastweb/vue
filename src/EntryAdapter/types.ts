import type { Entry } from '@pastweb/tools/createEntry/types';

export type GenericEntry = Entry<any> & {
  mount: (hydrate?: boolean) => string | void;
  update: (value: Record<string, any>) => void;
  unmount: () => void;
};

/**
 * Props for {@link EntryAdapter}.
 *
 * Hydration is inferred from the nearest Vue `Island` context. Render the
 * adapter inside an `Island` when the nested entry should hydrate server markup.
 */
export interface EntryAdapterProps {
  /**
   * Factory returning the entry controlled by this adapter.
   *
   * When `ssrEntry` is omitted during SSR, this entry can also be used as the
   * server renderer by integrations that share a single client/server entry.
   */
  entry: () => GenericEntry;

  /**
   * Optional async factory returning the server-side entry.
   *
   * Declaring this prop keeps the Vue client adapter API aligned with the React
   * adapter and prevents `ssrEntry` from being forwarded as entry data. SSR
   * integrations can use it to load a server-only entry bundle.
   *
   * @example
   * ```vue
   * <EntryAdapter
   *   :entry="createClientEntry"
   *   :ssr-entry="() => import('./entry.server').then(module => module.entry())"
   * />
   * ```
   */
  ssrEntry?: () => Promise<GenericEntry>;

  /** Additional attrs merged into the entry `initData`. */
  [propName: string]: any;
}
