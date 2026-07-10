import type {
  MicroStoreActions,
  ReuseMicroStoreResult,
  VueMicroStoreSelector,
} from './reuseMicroStore';

export type { MicroStoreActionsContext, MicroStoreConfig } from '@pastweb/tools/createMicroStore';

export type VueUseMicroStore<
  S extends Record<string, any>,
  A extends MicroStoreActions,
> = {
  (): ReuseMicroStoreResult<S, A>;
  <T>(selector: VueMicroStoreSelector<T, S>): ReuseMicroStoreResult<S, A, T>;
};
