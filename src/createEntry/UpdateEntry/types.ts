import type { Component } from 'vue';
import type { EventCallback, RemoveListener } from '@pastweb/tools';

/**
 * Props accepted by the browser-only `UpdateEntry` wrapper.
 */
export interface UpdateEntryProps {
  /** Entry component rendered by the wrapper. */
  component: Component;
  /** Initial props forwarded to the entry component. */
  childProps?: Record<string, any>;
  /** Entry event listener used to subscribe to update events. */
  on: (event: string, eventCallback: EventCallback) => RemoveListener;
};
