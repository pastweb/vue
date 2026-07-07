import type { Component, VNode } from 'vue';
import type {
  Portal as P,
  PortalAnchorsIds,
  PortalHandler,
  Portals as PortalsCache,
} from '@pastweb/tools/portals';

/**
 * Vue-specialized portal descriptor.
 *
 * It keeps the framework-agnostic portal lifecycle from `@pastweb/tools`, but
 * narrows `open` so Vue components and VNodes can be passed directly.
 */
export type Portal = Omit<P, 'open'> & {
  open: (component: Component | VNode | null, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>) => string | false;
};

/**
 * Shape of a portal factory produced by `installPortals`.
 */
export declare function portalFunction(component: Component | VNode | null, props?: Record<string, any> | (() => Record<string, any>), defaults?: Record<string, any>,): PortalHandler
export declare namespace portalFunction {
  const open: (component: Component | VNode | null, props?: Record<string, any> | (() => Record<string, any>) | undefined, defaults?: Record<string, any> | undefined) => string | false;
  const update: (entryId: string, props: Record<string, any>) => boolean;
  const close: (entryId: string) => void;
  const remove: (entryId: string) => boolean;
  const getEntryId: () => string;
  const removeEntryId: (id: string) => void;
};

/** Function used by application code to create a portal handler for one anchor. */
export type PortalFunction = typeof portalFunction;

/** Nested portal descriptor map keyed by portal path. */
export interface PortalsDescriptor {
  [pathName: string]: Portal | PortalsDescriptor | typeof portalFunction;
}

/**
 * Vue entry factory passed to `installPortals`.
 *
 * The tools portal layer calls this function whenever a portal entry is opened.
 */
export type EntryDescriptor = (props: Record<string, any>, component: Component | VNode | null) => any;

/** Anchor ids keyed by portal path. */
export type { PortalAnchorsIds, PortalsCache };
