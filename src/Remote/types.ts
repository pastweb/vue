import type { Component } from 'vue';
import type { Content } from '../Render';

/** Loads one prerequisite module before the remote component is imported. */
export type RemoteDependency = () => Promise<any>;

/** Module shape expected from a remote Vue component loader. */
export interface RemoteModule {
  default: Component;
}

/** Props accepted by the Vue {@link Remote} component. */
export interface RemoteProps {
  /** Function that resolves the remote module's default Vue component export. */
  component: () => Promise<RemoteModule>;

  /** One loader or a group of loaders that must finish before `component`. */
  dependency?: RemoteDependency | RemoteDependency[];

  /** Content rendered while dependencies and the remote module are loading. */
  fallback?: Content | null;

  /** Content rendered when dependency or remote-module loading fails. */
  errorFallback?: Content | null;
}
