import type { WithDefaultPropsOptions } from '../withDefaultProps/types';
import type { GetEventHandlersOptions } from '../getEventHandlers/types';

export type WithDefaultPropsHandlersOptions = Omit<WithDefaultPropsOptions, 'exclude'> & Omit<GetEventHandlersOptions, 'exclude'> & {
  excludeProps?: string | RegExp | (string | RegExp)[];
  excludeHandlers?: string | RegExp | (string | RegExp)[];
}

export type WidthDefaultPropsHandlersOptions = WithDefaultPropsHandlersOptions;
