import type { Component } from 'vue';
import type { AsyncStore } from '@pastweb/tools';
import type { UpdateEntryProps } from '../UpdateEntry';

/**
 * Async dependency accepted by the entry wait wrapper.
 */
export type Wait = Promise<any> | (() => Promise<any>) | AsyncStore<any>;

/**
 * Props accepted by the browser-only `WaitFor` entry wrapper.
 */
export type WaitForProps = {
  /** Component rendered while async dependencies are still pending. */
  fallback?: Component;
  /** Component rendered once dependencies resolve. */
  component: Component;
  /** Async dependencies that must resolve before rendering `component`. */
  wait: Promise<any> |
    (() => Promise<any>) |
    AsyncStore<any> |
    (Promise<any> | (() => Promise<any>) | AsyncStore<any>)[];
  /** Props forwarded to the wrapped entry update component. */
  childProps: UpdateEntryProps;
}
