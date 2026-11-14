# Changelog

- Fixed managed floating-window bounds and drag persistence in the Vue renderer.
  Window portal anchors now provide a full workspace, mediator bounds updates
  invalidate rendered animation styles, and TaskBar controls remain above
  floating windows so they can activate, minimize, and restore them.
- Added `reuseColorScheme` and aligned `useColorScheme` with the React color-scheme composable API.
- Renamed the Vue router plugin factory from `createRouter` to `installRouter`.
- Added Vue Window Manager integration through `installWindowManager` and
  `useWindowManager`.
- Updated `Portal` to register managed portal entries, inject the manager into
  portal content, prevent duplicate opens, and unregister entries after removal.
- Updated `withDefaultProps` default boolean character normalization to use `'true'` and `'false'`.
- Updated `Slot` to resolve the owning component's named slot before local
  fallbacks, pass scoped props consistently, and invoke `map` for each rendered
  VNode with its index.
