import { DEFAULT_ISLAND_PROPS, ISLAND_CONTEXT_KEY } from '@pastweb/tools/Island';
import type { IslandDefaultProps as IDP } from './types';

export { ISLAND_CONTEXT_KEY };

/**
 * Vue Island defaults adapted from the framework-agnostic tools contract.
 */
export const DEFAULT_PROPS: Pick<IDP, 'client' | 'idleTimeout'> = DEFAULT_ISLAND_PROPS;
