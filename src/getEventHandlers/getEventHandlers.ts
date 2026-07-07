import type { GetEventHandlersOptions } from './types'

const EVENT_HANDLER_PROP_RE = /^on[A-Z]/

/**
 * Converts Vue-style event handler properties from a props object into a plain
 * object suitable for Vue's `v-on` directive binding.
 *
 * Handler props must start with `on` followed by an uppercase character, such
 * as `onClick`, `onChange`, or `onUpdateModelValue`. This keeps ordinary props
 * such as `online` or `once` from being treated as events. The helper strips
 * the `on` prefix and converts camelCase to kebab-case (for example,
 * `onMyCustomEvent` becomes `my-custom-event`).
 *
 * @param props - The object containing component props and event handlers
 *                (e.g. `{ title: string, onClick: Function, onChange: Function }`)
 * @param options - Configuration options
 * @param options.exclude - Event names (without "on" prefix) to exclude.
 *                          Can be a string, RegExp, or array of both.
 *                          Exclusion is matched against the kebab-cased event name.
 *
 * @returns An object with event names as keys and handler functions as values,
 *          ready to be used with `v-on="events"`
 *
 * @example
 * ```ts
 * const props = {
 *   title: "Hello",
 *   disabled: false,
 *   onClick: () => console.log('clicked'),
 *   onChange: (value: string) => console.log(value),
 *   onMyCustomEvent: (payload: any) => {},
 *   onUpdateModelValue: (val: any) => {},
 * }
 *
 * const events = getEventHandlers(props, {
 *   exclude: ['update:model-value', /^my-/]
 * })
 *
 * // Result: { click: fn, change: fn }
 * ```
 */
export function getEventHandlers(props: Record<string, any>, options: GetEventHandlersOptions = {}): Record<string, Function> {
  const events: Record<string, Function> = {}
  const { exclude } = options

  const shouldExclude = (eventName: string): boolean => {
    if (!exclude) return false

    const excludes = Array.isArray(exclude) ? exclude : [exclude]

    return excludes.some((rule) => {
      if (typeof rule === 'string') {
        return eventName === rule
      }
      if (rule instanceof RegExp) {
        return rule.test(eventName)
      }
      return false
    })
  }

  for (const [key, value] of Object.entries(props)) {
    if (!EVENT_HANDLER_PROP_RE.test(key) || typeof value !== 'function') {
      continue
    }

    // Remove "on" prefix
    let eventName = key.slice(2)

    // Convert to kebab-case (e.g., MyCustomEvent → my-custom-event)
    eventName = eventName
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()

    // Check exclusion (applied to the name without "on")
    if (shouldExclude(eventName)) {
      continue
    }

    events[eventName] = value
  }

  return events
}
