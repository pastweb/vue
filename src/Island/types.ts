import type { IslandDefaultProps as IDP, IslandProps as IP } from '@pastweb/tools/Island';

export type { ClientStrategy } from '@pastweb/tools/Island';

/**
 * Props for the Vue {@link Island} component.
 *
 * Vue Island uses the shared `@pastweb/tools` island contract for hydration
 * strategies, media queries, idle timeout, and `islandId`. Renderable content is
 * supplied through Vue slots.
 */
export interface IslandProps extends Omit<IP, 'fallback'> {}

/**
 * Vue Island props after defaults from `@pastweb/tools` have been applied.
 */
export interface IslandDefaultProps extends Omit<IDP, 'fallback'> {}
