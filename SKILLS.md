# `@pastweb/vue` implementation skills

This document contains Vue-specific workflow for the package. The general
Pastweb rules for public APIs, helper organization, mediators, documentation,
testing discipline, and release safety are inherited from `../tools/SKILLS.md`;
do not duplicate or weaken them here.

## Start from the shared contract

1. Read the relevant `@pastweb/tools` or `@pastweb/components-core` types,
   mediator, README, and tests before changing a Vue adapter.
2. Identify whether the requested behavior belongs in a shared mediator or only
   in the Vue bridge. Move shared state transitions and event semantics to the
   core package; keep templates, VNodes, refs, context providers, and Vue
   lifecycle here.
3. Preserve prop names, default behavior, callback ordering, IDs, accessibility
   state, slots, and context keys from the shared contract.
4. Update local barrels, package-root exports, TSDoc/README examples, and tests
   together when a public Vue API changes.

## Composition API and lifecycle

- Follow Vue's Composition API rules. Call composables unconditionally and in a
  stable order, and keep reactive dependencies explicit.
- Use `ref`, `reactive`, and `computed` for state owned by the adapter. Avoid
  mirrors when the mediator or an external store already owns the state.
- Keep watchers, subscriptions, timers, event listeners, portal registrations,
  and mediator mounts paired with cleanup. Cleanup must be safe when Vue invokes
  setup and teardown more than once.
- Use the existing `useMediator`, `useMounted`, `useBeforeMount`, and
  `useBeforeUnmount` bridges rather than reproducing their lifecycle logic.
- Keep render functions and computed getters free of side effects. Register
  resources in lifecycle hooks or explicit event callbacks.
- Keep SSR-safe code free of unconditional browser API access; defer DOM work to
  mounted hooks or the package's lifecycle bridges.

## Templates, slots, and context

- Use the package `Slot`, `Template`, and context helpers for slot semantics.
  Keep slot collection, fallback handling, mapping, and VNode conversion in the
  Vue package.
- Preserve the semantic shell required by `@pastweb/components-core`. A custom
  slot must not remove required roles, labels, keyboard handlers, IDs, or ARIA
  relationships unless the contract supplies replacements.
- Use typed provide/inject contexts for portal, router, API-cache, store, and
  mediator integrations. Keep provided values stable when consumers depend on
  identity.
- Prefer Vue event bindings and component emits at the renderer boundary. A
  template handler may adapt the event, then call the mediator with the shared
  argument shape.
- Preserve native semantics and accessibility attributes in templates. Use
  normalized mediator state for disabled, open, selected, busy, labelled, and
  unavailable values instead of recomputing them from raw props.

## Props, refs, and events

- Keep framework-neutral types at the shared boundary and Vue/DOM types in this
  package.
- Normalize props through `withDefaultProps` where the Vue adapter needs the
  package's string boolean or `class` conventions. Do not silently replace the
  public shared prop contract.
- Forward component refs only when the public component contract exposes them;
  use the Vue ref bridge and keep the exposed handle stable.
- Adapt callback props and emitted events without widening handlers to `any`.
  Support both callback-prop and template event syntax where the component
  contract documents both.

## Async, portals, routing, and stores

- `AsyncComponent` and `Remote` must separate loading, success, and error
  rendering. Keep dependency promises stale-result safe and use the documented
  error behavior for render failures.
- Keep `Remote` independent from `AsyncComponent` when server-side composition
  or micro-frontend behavior requires a separate contract.
- Portal providers and hooks must register anchors and handlers through the
  shared portal contract, clean up on unmount, and remain safe during SSR.
- Router providers and composables should adapt `@pastweb/tools` router state
  without creating a second navigation source. Keep links, route views, and
  location hooks synchronized with provider lifecycle.
- Vue store bridges may expose Pinia or micro-store composables, but shared state
  transitions belong to the underlying store implementation. Do not recreate
  store state in provider setup functions.
- Window-manager bridges must register, update, activate, and unregister windows
  with balanced lifecycle hooks. Verify repeated mounting does not duplicate
  windows or taskbar entries.

## Type and export discipline

- Use Vue and DOM types only at the Vue boundary. Shared packages should receive
  framework-neutral types.
- Prefer named exports and local `index.ts` barrels. Add package-root exports
  only for APIs intended for general use; keep dynamic-import-only defaults
  explicitly documented.
- Keep peer dependencies accurate for Vue integrations. Optional integrations
  such as Pinia must be marked optional when the package works without them.
- In examples, use root imports when a symbol is exported from `@pastweb/tools`
  and use subpaths only for symbols unavailable from the root or for a
  subpath-specific example.

## Vue tests

- Use Vitest with Vue Test Utils for rendered behavior, and use `vi` for mocks,
  timers, and spies.
- Keep tests under `tests/<feature>/<feature>.<environment>.test.ts`; use
  `.node.test.ts` for renderer-independent logic and `.web.test.ts` for DOM or
  jsdom behavior.
- Name tests with `given..., when..., then...` and cover initial render, prop
  changes, emitted events, callback ordering, keyboard interaction, focus and
  ref behavior, repeated mounts, SSR-safe behavior, portal cleanup, async errors,
  and optional provider integrations.
- Test adapters through user-visible behavior. Test mediator state transitions in
  `@pastweb/components-core` rather than copying every core test into Vue.
- Run focused tests first, then `pnpm test --run`, typecheck, and build scripts.
  Investigate failures rather than masking them with looser types or skipped
  tests.

## Documentation and review checklist

When a Vue API changes, update its README/TSDoc example, local and root exports,
peer dependency metadata, and changelog entry when appropriate. Examples should
show the Vue adapter and identify the shared core contract it consumes.

Before handoff, verify:

- composables obey stable ordering and lifecycle cleanup rules;
- refs, listeners, subscriptions, timers, and portal registrations clean up;
- SSR does not access unavailable browser resources;
- templates preserve shared semantic and accessibility contracts;
- async and error states cannot become stale or stuck;
- package exports and peer dependencies are accurate; and
- focused tests, the full suite, type checks, and builds are either passing or
  their environmental blockers are documented.
