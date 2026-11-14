# `@pastweb/vue` contribution guide

## Package identity

`@pastweb/vue` is Pastweb's Vue integration layer. It adapts the shared
contracts from `@pastweb/tools` and `@pastweb/components-core` to Vue
composables, components, refs, slots, provide/inject context, portals, and
server-rendered entries. It owns Vue lifecycle and rendering integration; it
must not duplicate framework-neutral mediator logic.

Apply the inherited public-package guidance in [`../tools/AGENTS.md`](../tools/AGENTS.md)
and [`../tools/SKILLS.md`](../tools/SKILLS.md), together with the component
contracts documented by `@pastweb/components-core`.

## Architectural boundaries

- Keep shared behavior in `@pastweb/tools` or `@pastweb/components-core`; keep
  Vue-specific behavior in this package.
- Do not import private or closed-source packages into this public package.
- Do not expose Vue component instances, VNodes, Vue refs, or DOM classes from
  framework-neutral packages.
- Preserve the public mediator contracts while adapting refs, events, slots,
  context, and lifecycle to Vue.
- Prefer local feature barrels and deliberate package-root exports. Keep public
  documentation and examples safe for release.

## Vue-specific standards

- Use the Composition API and call composables unconditionally and in stable
  order. Do not call composables from event handlers, loops, or conditional
  branches.
- Keep `computed`, `watch`, subscriptions, timers, event listeners, portal
  registrations, and mediator mounts paired with appropriate cleanup.
- Use the package's `useMounted`, `useBeforeMount`, `useBeforeUnmount`, and
  mediator bridges instead of reproducing lifecycle logic in components.
- Adapt native DOM events at the Vue boundary and preserve the shared callback
  argument order. Behavior that belongs in a mediator should not be added to a
  template handler.
- Use the package `Slot`, context, and provide/inject helpers for shared slot and
  context semantics. Keep VNode conversion and template rendering in this
  package rather than in `@pastweb/tools`.
- Make async components, portal providers, router providers, SSR entries, and
  window-manager bridges safe under repeated mounting, unmounting, and SSR.
- Use `withDefaultProps` for the package's Vue prop normalization contract and
  preserve the declared boolean and class conventions in component adapters.

## Related guidance

Detailed Vue implementation, testing, integration, and review workflows are in
[`SKILLS.md`](./SKILLS.md). General helper organization, API compatibility,
documentation, and release rules remain inherited from `@pastweb/tools`.
