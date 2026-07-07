import type { Component, Plugin, ObjectDirective } from 'vue';
import type { Entry, EntryOptions } from '@pastweb/tools';
import type { WaitForProps } from './WaitFor';

/**
 * Vue plugin plus optional install options.
 */
export interface PluginDescriptor {
  /** Vue plugin passed to `app.use`. */
  plugin: Plugin;
  /** Options forwarded to `app.use(plugin, ...options)`. */
  options: any | any[];
};

/**
 * Map of global component names to Vue components.
 */
export interface ComponentDescriptor { [componentName: string]: Component };

/**
 * Map of global directive names to Vue directives.
 */
export interface DirectiveDescriptor { [directiveName: string]: ObjectDirective<any, any> };

/**
 * Global component and directive registration options for a Vue entry.
 */
export interface Register {
  /** Components registered with `app.component`. */
  component?: ComponentDescriptor;
  /** Directives registered with `app.directive`. */
  directive?: DirectiveDescriptor;
};

/**
 * Normalized registration shape used internally by entry setup.
 */
export interface NormalizedRegister {
  /** Component registrations, always an object. */
  component: ComponentDescriptor;
  /** Directive registrations, always an object. */
  directive: DirectiveDescriptor;
}

/**
 * Public options accepted by Vue browser and server entries.
 */
export type VueEntryOptions = EntryOptions & {
  /** Root component rendered by the entry. */
  EntryComponent?: Component;
  /** Vue plugin, plugin descriptor, or list of plugins/descriptors to install. */
  use?: Plugin | PluginDescriptor | (Plugin | PluginDescriptor)[];
  /** Global component/directive registrations. */
  register?: Register;
  /** Async dependencies to wait for before showing the browser entry component. */
  waitFor?: WaitForProps['wait'];
  /** Fallback component shown while waiting, or on server wait failure. */
  fallback?: WaitForProps['fallback'];
};

/**
 * Internal normalized Vue entry options.
 */
export type VueEntryNormalizedOptions = EntryOptions & {
  /** Root component rendered by the entry. */
  EntryComponent?: Component;
  /** Normalized plugin list. */
  use: (Plugin | PluginDescriptor)[];
  /** Normalized registration maps. */
  register: NormalizedRegister;
  /** Async dependencies to wait for before showing the browser entry component. */
  waitFor?: WaitForProps['wait'];
  /** Fallback component shown while waiting, or on server wait failure. */
  fallback?: WaitForProps['fallback'];
};

/**
 * Vue-specific entry shape returned by `createEntry` and `createServerEntry`.
 */
export type VueEntry = Omit <Entry<VueEntryOptions>, 'mount'| 'update' | 'unmount'> & {
  /** Mounts or hydrates the browser entry, or starts server render memoization. */
  mount: (hydrate?: boolean) => void | string;
  /** Updates the current entry component props. */
  update: (value: Record<string, any>) => void;
  /** Unmounts the browser Vue app. */
  unmount: () => void;
};
