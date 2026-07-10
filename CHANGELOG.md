# Changelog

- Added `reuseMatchDevice` to bridge tools reactive device state into Vue rendering.
- Added the Vue `useMatchDevice` composable with reactive device matches, package exports, documentation, and test coverage.
- Added the Vue `AsyncComponent` surface with dependency loading, client fallback rendering, SSR async-task preloading, package exports, Vue README examples, and browser/server test coverage.
- Added a Vue `createMicroStore` factory that wraps tools micro-stores and returns a Vue-ready composable.
- Added `reuseMicroStore` for bridging framework-agnostic tools micro-stores into Vue rendering with selector support.
- Exported the micro-store surface from the package root and added package subpaths for `createMicroStore`, `reuseMicroStore`, and related types.
- Documented `createMicroStore` and `reuseMicroStore` with Vue examples and root `@pastweb/tools` imports where available.
- Added browser test coverage for full-store reuse, selector updates, deeply nested full-store changes, and deeply nested selected-object changes.
- Updated root export tests to cover `createMicroStore` and `reuseMicroStore`.
