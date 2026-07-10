import type { MicroStore, Selector, UseMicroStore } from '@pastweb/tools/createMicroStore';

export type { MicroStore, Selector, UseMicroStore } from '@pastweb/tools/createMicroStore';

export type MicroStoreActions = Record<string, (...args: any[]) => any>;

export type ReuseMicroStoreResult<
  S extends Record<string, any>,
  A extends MicroStoreActions,
  T = never,
> = [T] extends [never]
  ? MicroStore<S, A>
  : { state: Readonly<T> } & A;

export type VueMicroStore<
  S extends Record<string, any>,
  A extends MicroStoreActions,
> = UseMicroStore<S, A>;

export type VueMicroStoreSelector<T, S extends Record<string, any>> = Selector<T, S>;
