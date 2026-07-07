import { shallowReactive, watchEffect } from 'vue';
import { withDefaultProps } from '../withDefaultProps';
import { getEventHandlers } from '../getEventHandlers';
import { EVENT_HANDLER_PROP_RE } from './constants';
import type { WithDefaultPropsHandlersOptions } from './types';

/**
 * Combines `withDefaultProps` and `getEventHandlers`.
 *
 * Returns a tuple `[normalizedProps, events]` where:
 * - `normalizedProps` contains regular props merged with defaults (with boolean char normalization and className handling)
 * - `events` contains Vue-style handlers extracted from keys like `onClick`,
 *   ready for Vue's `v-on` binding.
 *
 * Handler props are identified by `on` followed by an uppercase character.
 * This means `onClick` is separated into the returned events object, while
 * ordinary props such as `online` or `once` keep their defaults.
 *
 * @param props - Source Vue props object (usually from `defineProps()`)
 * @param defaults - Default values for both regular props and event handlers (`onClick`, `onChange`, etc.)
 * @param options - Combined options for prop normalization and event filtering
 * @returns `[normalizedProps, events]`
 *
 * @example
 * ```ts
 * const [props, events] = withDefaultPropsHandlers(
 *   defineProps<{ tone?: string; block?: '+' | '-' }>(),
 *   {
 *     tone: 'neutral',
 *     block: '-',
 *     onClick: () => console.log('clicked'),
 *     onChange: (value: any) => console.log('changed', value),
 *     onInternalEvent: () => {},   // can be excluded
 *     debug: false,
 *   },
 *   {
 *     excludeProps: ['debug'],          // exclude from prop defaults
 *     excludeHandlers: /^internal/      // exclude from event handlers
 *   }
 * );
 *
 * // Usage in template:
 * <MyComponent
 *   v-bind="props"
 *   v-on="events"
 * />
 * ```
 */
export function withDefaultPropsHandlers<T extends Record<string, any>>(
  props: Record<string, any>,
  defaults: Record<string, any>,
  options: WithDefaultPropsHandlersOptions = {},
): [T, Record<string, Function>] {
  const excludeProps = options.excludeProps && Array.isArray(options.excludeProps) ? options.excludeProps : options.excludeProps ? [options.excludeProps] : [];
  excludeProps.push(EVENT_HANDLER_PROP_RE);
  const propsOptions: Parameters<typeof withDefaultProps>[2] = {
    exclude: excludeProps,
  };

  if (options.booleanChars) {
    propsOptions.booleanChars = options.booleanChars;
  }

  if (options.className !== undefined) {
    propsOptions.className = options.className;
  }

  const propsForDefaults = shallowReactive<Record<string, any>>({});

  watchEffect(() => {
    const nextProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !EVENT_HANDLER_PROP_RE.test(key)),
    );

    Object.keys(propsForDefaults).forEach(key => {
      if (!(key in nextProps)) delete propsForDefaults[key];
    });
    Object.assign(propsForDefaults, nextProps);
  });

  const newProps = withDefaultProps<T>(propsForDefaults, defaults, propsOptions);

  const events = shallowReactive<Record<string, Function>>({});

  watchEffect(() => {
    const nextEvents = getEventHandlers({ ...defaults, ...props }, {
      exclude: options.excludeHandlers,
    });

    Object.keys(events).forEach(key => {
      if (!(key in nextEvents)) delete events[key];
    });
    Object.assign(events, nextEvents);
  });

  return [newProps as T, events];
}
