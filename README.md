# @pastweb/vue

Vue integration package for building tools-powered Vue applications.

It provides Vue-specific bindings for the framework-agnostic primitives in `@pastweb/tools`: API/query composables, router integration, entry composition, portals, rendering helpers, context helpers, lifecycle utilities, and Vue utility composables. Use it as a standalone Vue utility layer or as part of a larger Pastweb-based stack.

## Features

- **Tools-first architecture** - Vue composables and components wrap the core `@pastweb/tools` functionality instead of replacing it.
- **API/query integration** - Vue wrappers for query cache access, `useQuery`, `useMutation`, `useQueries`, `useInfiniteQuery`, and reusable query state.
- **Router integration** - Vue components and composables for `createViewRouter`.
- **Entry composition** - Vue entry helpers for mounting, updating, plugins, components, directives, and async waits.
- **Portal support** - Vue components and composables for portal descriptors and anchors.
- **Window Manager support** - Vue plugin and composable support for application-managed portal windows.
- **TypeScript-first** - Public APIs include TSDoc and exported types for app-level integration.

## Installation

```bash
npm i -S @pastweb/vue
# or
pnpm i -S @pastweb/vue
# or
yarn add -S @pastweb/vue
```

## Documentation Overview

The documentation is organized into the following major categories. Each section provides syntax notes, practical examples, and integration guidance where useful.

- **Core functions** - `getContext` and `setContext` helpers for sharing Vue-provided values.
- **API functions** - Query cache installer and Vue wrappers around tools API hooks.
- **Async functions** - Pinia async store helpers and color-scheme composable factory.
- **Routing** - Vue integration for `createViewRouter`.
- **Browser functions** - Browser-aware composables such as device matching.
- **Element functions** - Async rendering, remote-module loading, entry rendering, islands, portals, slots, and UI composition helpers.
- **Hook functions** - Vue lifecycle and mediator composables.
- **Utility functions** - Small Vue utilities such as `Render`, `computed`, `useRef`, and `withDefaultProps`.

This project is distributed under the MIT licence.

## Summary

- [Core functions](#core-functions)
  - [getContext](#getcontext)
  - [setContext](#setcontext)
- [API functions](#api-functions)
  - [installApiCache](#installapicache)
  - [useApiQueryCache](#useapiquerycache)
  - [reuseQuery](#reusequery)
  - [reuseMutation](#reusemutation)
  - [useQuery](#usequery)
  - [useMutation](#usemutation)
  - [useQueries](#usequeries)
  - [useInfiniteQuery](#useinfinitequery)
- [Async functions](#async-functions)
  - [createPiniaAsyncStore](#createpiniaasyncstore)
  - [createMicroStore](#createmicrostore)
  - [reuseMicroStore](#reusemicrostore)
  - [reuseColorScheme](#reusecolorscheme)
  - [useColorScheme](#usecolorscheme)
- [Routing](#routing)
  - [installRouter](#installrouter)
  - [RouterView](#routerview)
  - [RouterLink](#routerlink)
  - [useLocation](#uselocation)
  - [useNavigate](#usenavigate)
  - [usePaths](#usepaths)
  - [useRoute](#useroute)
  - [useRouter](#userouter)
  - [useRouterLink](#userouterlink)
  - [useSearchParams](#usesearchparams)
- [Browser functions](#browser-functions)
  - [useMatchDevice](#usematchdevice)
  - [reuseMatchDevice](#reusematchdevice)
- [Element functions](#element-functions)
  - [AsyncComponent](#asynccomponent)
  - [Remote](#remote)
  - [createEntry](#createentry)
  - [createServerEntry](#createserverentry)
  - [EntryAdapter](#entryadapter)
  - [Island](#island)
  - [portals](#portals)
  - [window manager](#window-manager)
  - [Render](#render)
  - [Slot](#slot)
- [Hook functions](#hook-functions)
  - [useBeforeMount](#usebeforemount)
  - [useBeforeUnmount](#usebeforeunmount)
  - [useMediator](#usemediator)
  - [useMounted](#usemounted)
  - [useRef](#useref)
- [Utility functions](#utility-functions)
  - [computed](#computed)
  - [useChildren](#usechildren)
  - [withDefaultProps](#withdefaultprops)

---
## Core functions

### `getContext`

Reads one value from the active Vue dependency-injection context.

Use `getContext` inside component setup or inside composables that run during setup. Package composables should use this helper instead of importing Vue `inject` directly, so context access stays consistent across the Vue integration.

> #### Syntax

```ts
function getContext<T = any>(key: string): T;
```

Parameters
* `key`: `string`
  * Context key that was provided with `setContext`, a Vue plugin, or another Vue provider.

Returns
* `T`
  * The injected value cast to `T`. Include `undefined` in `T` when the provider is optional.

**Example:**
```ts
import { getContext, setContext } from '@pastweb/vue';

setContext('session', { userId: 'user-1' });
const session = getContext<{ userId: string }>('session');
```

### `setContext`

Provides one value through Vue dependency injection.

Call it during component setup or inside a composable that runs during setup. Use it instead of importing Vue `provide` directly in package composables.

> #### Syntax

```ts
function setContext<T = undefined>(key: string, value: T): void;
```

**Example:**
```ts
import { setContext } from '@pastweb/vue';

setContext('session', { userId: 'user-1' });
```

---
## API functions

The API helpers are Vue wrappers around the framework-agnostic query/cache primitives from `@pastweb/tools`. The cache and agent still live in `tools`; this package provides Vue app installation, injection access, and Vue render updates for the reactive query states.

### `installApiCache`

Creates a Vue plugin that provides a `QueryCache` to API composables.

> #### Syntax

```ts
function installApiCache(options: ApiCacheOptions): ApiCachePlugin
```

**Example:**
```ts
import { createApp } from 'vue';
import { createQueryCache } from '@pastweb/tools';
import { installApiCache } from '@pastweb/vue';
import App from './App.vue';

const queryCache = createQueryCache();

createApp(App)
  .use(installApiCache({ queryCache }))
  .mount('#app');
```

### `useApiQueryCache`

Returns the active `QueryCache` installed with `installApiCache`.

> #### Syntax

```ts
function useApiQueryCache(): QueryCache
```

**Example:**
```ts
import { useApiQueryCache } from '@pastweb/vue';

const queryCache = useApiQueryCache();
```

### `reuseQuery`

Bridges any tools reactive query-like state into Vue rendering. The returned object keeps the tools state shape, and Vue components update when its enumerable fields change.

> #### Syntax

```ts
function reuseQuery<TState extends Record<PropertyKey, any>>( createState: () => TState ): TState
```

**Example:**
```ts
import { createApiAgent, createQueryCache, useQuery as createToolsQuery } from '@pastweb/tools';
import { reuseQuery } from '@pastweb/vue';

const queryCache = createQueryCache();
const agent = createApiAgent({ queryCache });

export function useUsers() {
  return reuseQuery(() => createToolsQuery({
    fn: () => agent.get('/api/users', { queryKey: ['users'] }),
  }));
}
```

### `reuseMutation`

Alias of `reuseQuery` for mutation-style state. It uses the same implementation, but makes custom mutation composables easier to read.

> #### Syntax

```ts
function reuseMutation<TState extends Record<PropertyKey, any>>(
  createState: () => TState,
): TState
```

**Example:**
```ts
import { useMutation as createToolsMutation } from '@pastweb/tools';
import { reuseMutation } from '@pastweb/vue';

export function useSaveUser(agent: Agent) {
  return reuseMutation(() => createToolsMutation({
    fn: user => agent.post('/api/users', user),
  }));
}
```

### `useQuery`

Vue wrapper for `@pastweb/tools` `useQuery`.

> #### Syntax

```ts
function useQuery<T>(config: QueryConfig<T>): QueryInfo<T>
```

**Example:**
```vue
<script setup lang="ts">
import { useQuery } from '@pastweb/vue';

const users = useQuery({
  fn: () => agent.get('/api/users', { queryKey: ['users'] }),
});
</script>

<template>
  <span v-if="users.isLoading">Loading...</span>
  <span v-else-if="users.isError">Could not load users</span>
  <ul v-else>
    <li v-for="user in users.data ?? []" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

### `useMutation`

Vue wrapper for `@pastweb/tools` `useMutation`.

> #### Syntax

```ts
function useMutation<T>(config: MutationConfig<T>): MutationInfo<T>
```

**Example:**
```vue
<script setup lang="ts">
import { useMutation } from '@pastweb/vue';

const saveUser = useMutation({
  fn: payload => agent.post('/api/users', payload),
});
</script>

<template>
  <button :disabled="saveUser.isMutating" @click="saveUser.mutate(user)">
    Save
  </button>
</template>
```

### `useQueries`

Vue wrapper for multiple tools queries.

> #### Syntax

```ts
function useQueries<T extends readonly QueryConfig<any>[]>(
  config: UseQueriesInput<T>,
): UseQueriesInfo<T>
```

**Example:**
```ts
const dashboard = useQueries({
  queries: [
    { fn: () => agent.get('/api/users', { queryKey: ['users'] }) },
    { fn: () => agent.get('/api/posts', { queryKey: ['posts'] }) },
  ],
});
```

### `useInfiniteQuery`

Vue wrapper for paginated tools queries.

> #### Syntax

```ts
function useInfiniteQuery<TPage, TPageParam = unknown>(
  config: InfiniteQueryConfig<TPage, TPageParam>,
): InfiniteQueryInfo<TPage, TPageParam>
```

**Example:**
```vue
<script setup lang="ts">
import { useInfiniteQuery } from '@pastweb/vue';

const posts = useInfiniteQuery({
  initialPageParam: 1,
  fn: page => agent.get(`/api/posts?page=${page}`, {
    queryKey: ['posts', page],
  }),
});
</script>

<template>
  <button :disabled="!posts.hasNextPage" @click="posts.fetchNextPage">
    More
  </button>
</template>
```

---
## Async functions

### `createPiniaAsyncStore`

Pinia is optional in `@pastweb/vue`. Install it before using this helper:

```bash
npm i -S pinia
```

Creates a Pinia-flavored async store wrapper around tools async store primitives. The returned async store includes a Pinia instance on `store`; calling `init()` runs `onInit(pinia)` and marks the store as ready once initialization completes.

Use it when a store needs to initialize asynchronously before the application starts reading from it.

> #### Syntax

```ts
function createPiniaAsyncStore(options: PiniaStoreOptions): PiniaAsyncStore
```

Parameters

* `name`: `string` _(optional)_
  * Optional name suffix for the underlying async store. The generated name is `PiniaAsyncStore` or `PiniaAsyncStore:name`.
* `onInit`: `(pinia: Pinia) => Promise<void> | void` _(optional)_
  * Initialization callback called with the created Pinia instance.

Returns

* `PiniaAsyncStore`
  * A tools async store with a `store` property containing the Pinia instance.

**Example:**
```ts
import { createApp } from 'vue';
import { createPiniaAsyncStore } from '@pastweb/vue/createPiniaAsyncStore';
import App from './App.vue';

const app = createApp(App);

export const piniaStore = createPiniaAsyncStore({
  name: 'app',
  async onInit(pinia) {
    app.use(pinia);
  },
});

await piniaStore.init();
await piniaStore.isReady;
```

### `createMicroStore`

`createMicroStore` takes the same parameters as `createMicroStore` from `@pastweb/tools`, creates the tools store, and returns a Vue-ready composable. The returned composable keeps the same readonly state/actions shape and updates Vue rendering after actions update selected state.

> #### Syntax

```ts
function createMicroStore<S, A>(
  name: string,
  setup: (select: <T>(fn: Selector<T, S>) => T) => MicroStoreConfig<S, A>,
): VueUseMicroStore<S, A>
```

Parameters

* `name`: `string`
  * Unique store name passed to the tools micro-store registry.
* `setup`: `(select: <T>(fn: Selector<T, S>) => T) => MicroStoreConfig<S, A>`
  * Tools micro-store setup function that returns initial state and actions.

Returns

* `VueUseMicroStore<S, A>`
  * Vue composable for reading the full store or a selected state value.

**Example:**
```ts
// @/stores/counterStore.ts
import { createMicroStore } from '@pastweb/vue';

export const useCounterStore = createMicroStore('counter', () => ({
  state: { count: 0 },
  actions: {
    increment() {
      this.state.count += 1;
    },
  },
}));
```

```vue
<!-- Counter.vue -->
<script setup lang="ts">
import { useCounterStore } from '@/stores/counterStore';

const { state, increment } = useCounterStore(state => state.count);
</script>

<template>
  <button @click="increment">
    {{ state.count }}
  </button>
</template>
```

### `reuseMicroStore`

`reuseMicroStore` bridges a tools micro-store that was created elsewhere into Vue rendering. It returns a **Vue composable** (same shape as `createMicroStore`). Call that composable in `setup`, optionally with a selector.

> #### Syntax

```ts
function reuseMicroStore<S, A>(
  store: UseMicroStore<S, A>,
): ReuseMicroStoreHook<S, A>
// useStore() | useStore(selector)
```

Parameters

* `store`: `UseMicroStore<S, A>`
  * Store returned by `createMicroStore` from `@pastweb/tools`.

Returns

* `ReuseMicroStoreHook<S, A>`
  * Composable: full store or selected state plus the original actions.

**Example:**
```ts
// @/stores/settingsStore.ts
import { createMicroStore } from '@pastweb/tools';
import { reuseMicroStore } from '@pastweb/vue';

const settingsStore = createMicroStore('settings', () => ({
  state: {
    user: {
      name: 'Ada',
      preferences: {
        theme: 'light',
      },
    },
  },
  actions: {
    useDarkTheme() {
      this.state.user.preferences.theme = 'dark';
    },
  },
}));

export const useSettingsStore = reuseMicroStore(settingsStore);
```

```vue
<!-- UserSummary.vue -->
<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore';

const user = useSettingsStore(state => state.user);
</script>

<template>
  <button @click="user.useDarkTheme">
    {{ user.state.name }}: {{ user.state.preferences.theme }}
  </button>
</template>
```

### `reuseColorScheme`

Creates a Vue color-scheme composable bound to an existing `MatchScheme`. Each consuming component receives a reactive mirror and removes its subscriptions on unmount.

> #### Syntax

```ts
function reuseColorScheme(matchScheme: MatchScheme): () => [ColorSchemeInfo, (mode: string) => void]
```

**Example:**
```ts
import { createMatchScheme } from '@pastweb/tools';
import { reuseColorScheme } from '@pastweb/vue';

const useColorScheme = reuseColorScheme(createMatchScheme({ defaultMode: 'auto' }));
const [info, setMode] = useColorScheme();

setMode('dark');
```

### `useColorScheme`

Vue composable for color-scheme state from `@pastweb/tools`. It creates a `MatchScheme` from the supplied options. Use `reuseColorScheme` to bind to an existing matcher.

> #### Syntax

```ts
function useColorScheme(options?: SchemeOptions): [ColorSchemeInfo, (mode: string) => void]
```

**Example:**
```ts
import { useColorScheme } from '@pastweb/vue';

const [info, setMode] = useColorScheme({ defaultMode: 'auto' });

setMode('dark');
```

---
## Routing

The router helpers integrate Vue with `createViewRouter` from `@pastweb/tools`. The tools router owns the route matching and reactive router state; this package provides Vue plugin installation, Vue dependency-injection access, and Vue-friendly reactive mirrors for components and composables.

### `installRouter`

Creates a Vue plugin for a tools `ViewRouter`. It provides the router under the shared tools router context key, initializes route depth for nested `RouterView` components, and registers `RouterView` and `RouterLink` globally.

> #### Syntax

```ts
function installRouter(router: ViewRouter): Plugin;
```

**Example:**
```ts
import { createViewRouter, type Route } from '@pastweb/tools';
import { installRouter, RouterView } from '@pastweb/vue';

const router = createViewRouter({
  routes: routes as Route[],
  RouterView,
});

app.use(installRouter(router));
```

### `RouterView`

Renders the selected route view for the active route depth. Named views use the `name` prop and route props are read from `route.meta.props`.

> #### Syntax

```ts
type RouterViewProps = {
  name?: string;
};
```

**Example:**
```vue
<template>
  <RouterView />
</template>
```

**Example with route props:**
```ts
const routes = [{
  path: '/user/:id',
  view: UserPage,
  meta: {
    props: {
      title: 'User profile',
    },
  },
}];
```

### `RouterLink`

Renders an anchor whose `href`, active state, and click navigation come from `router.getRouterLink`.

> #### Syntax

```ts
type RouterLinkProps = RouterLinkOptions & {
  className?: string;
  preventNavigate?: boolean;
};
```

**Example:**
```vue
<RouterLink
  path="/users/:id"
  :params="{ id: 123 }"
  :search-params="new URLSearchParams({ tab: 'profile' })"
  hash="details"
>
  User profile
</RouterLink>
```

### `useLocation`

Returns a Vue reactive mirror of the current tools router location.

> #### Syntax

```ts
function useLocation(): Location
```

**Example:**
```vue
<script setup lang="ts">
import { useLocation } from '@pastweb/vue';

const location = useLocation();
</script>

<template>
  <span>{{ location.pathname }}</span>
</template>
```

### `useNavigate`

Returns the router navigation function.

> #### Syntax

```ts
function useNavigate(): ViewRouter['navigate']
```

**Example:**
```vue
<script setup lang="ts">
import { useNavigate } from '@pastweb/vue';

const navigate = useNavigate();
</script>

<template>
  <button @click="navigate('/settings')">
    Settings
  </button>
</template>
```

### `usePaths`

Returns a Vue reactive route array filtered by the tools `filterRoutes` helper.

> #### Syntax

```ts
function usePaths(filter?: FilterDescriptor): Route[]
```

**Example:**
```vue
<script setup lang="ts">
import { usePaths, RouterLink } from '@pastweb/vue';

const docsPaths = usePaths({
  section: 'docs',
});
</script>

<template>
  <nav>
    <RouterLink
      v-for="route in docsPaths"
      :key="route.path"
      :path="route.path"
    >
      {{ route.meta?.title || route.path }}
    </RouterLink>
  </nav>
</template>
```

### `useRoute`

Returns a Vue reactive mirror of the selected route for the current view depth.

### `useRouter`

Returns the active tools `ViewRouter`.

**Example:**
```vue
<script setup lang="ts">
import { useRouter } from '@pastweb/vue';

const router = useRouter();

async function refreshRoute() {
  await router.navigate(router.location.pathname);
}
</script>

<template>
  <button @click="refreshRoute">
    Refresh route
  </button>
</template>
```

### `useRouterLink`

Returns a Vue reactive router link descriptor for a route target. The descriptor includes `pathname`, `isActive`, `isExactActive`, and `navigate`.

**Example:**
```vue
<script setup lang="ts">
import { useRouterLink } from '@pastweb/vue';

const link = useRouterLink({
  path: '/users/:id',
  params: { id: 123 },
  searchParams: new URLSearchParams({ tab: 'profile' }),
});
</script>

<template>
  <a
    :href="link.pathname"
    :aria-current="link.isExactActive ? 'page' : undefined"
    @click.prevent="link.navigate()"
  >
    User profile
  </a>
</template>
```

### `useSearchParams`

Returns URL search parameters for the current location and the router `setSearchParams` method.

**Example:**
```vue
<script setup lang="ts">
import { computed, useSearchParams } from '@pastweb/vue';

const search = useSearchParams();
const view = computed(() => search.params.get('view') || 'grid');

function setView(value: string) {
  const params = new URLSearchParams(search.params);
  params.set('view', value);
  search.setSearchParams(params);
}
</script>

<template>
  <button :aria-pressed="view === 'grid'" @click="setView('grid')">
    Grid
  </button>
  <button :aria-pressed="view === 'list'" @click="setView('list')">
    List
  </button>
</template>
```

---
## Browser functions

### `useMatchDevice`

`useMatchDevice` tracks device matches with the tools `createMatchDevice` helper. The returned `devices` object is reactive and stable, so it can be destructured in setup code and used directly in templates.

> #### Syntax

```ts
function useMatchDevice(config: DevicesConfig): DevicesResult
```

**Example:**
```vue
<script setup lang="ts">
import { useMatchDevice, useMounted } from '@pastweb/vue';

const config = {
  phone: { mediaQuery: '(max-width: 320px)' },
  tablet: { mediaQuery: '(max-width: 600px)' },
  desktop: { mediaQuery: '(max-width: 1024px)' },
};

const { devices, onMatch } = useMatchDevice(config);

useMounted(() => {
  onMatch('phone', (matches, device) => {
    console.log(`${device}: ${matches}`);
  });
});
</script>

<template>
  <MobileNav v-if="devices.phone" />
  <DesktopNav v-else />
</template>
```

---
### `reuseMatchDevice`

`reuseMatchDevice` bridges a reactive device state created by the tools `useMatchDevice` helper into Vue rendering. Use it when device state belongs to a framework-agnostic module, but a Vue component needs to render from it.

> #### Syntax

```ts
function reuseMatchDevice(matchDevice: DevicesResult): DevicesResult
```

**Example:**
```vue
<script setup lang="ts">
import { useMatchDevice as createToolsMatchDevice } from '@pastweb/tools';
import { reuseMatchDevice } from '@pastweb/vue';

const deviceState = createToolsMatchDevice({
  phone: { mediaQuery: '(max-width: 640px)' },
});

const { devices } = reuseMatchDevice(deviceState);
</script>

<template>
  <MobileNav v-if="devices.phone" />
  <DesktopNav v-else />
</template>
```

---
## Element functions

### `AsyncComponent`

`AsyncComponent` loads a Vue component with `import()` and renders it after optional dependencies have completed. On the client it can show a fallback while loading. On the server it registers the component load in the SSR async task queue, then renders the loaded component on the next render pass.

Use dependencies for code-split modules that must be initialized before the component is displayed, such as a store module, reducer-like registry, or feature service.

> #### Syntax

```ts
interface DependencyInfo {
  exportName?: string;
  dependency: Promise<any> | (() => Promise<any>);
  onSuccess?: (dependency: any) => void;
  onError?: (error: any) => void;
}

type Dependency = Promise<any> | (() => Promise<any>) | DependencyInfo;

interface AsyncComponentProps {
  component: () => Promise<{ default: Component }>;
  dependencies?: Dependency[];
  fallback?: Content | null;
}
```

**Basic example:**
```vue
<script setup lang="ts">
import { AsyncComponent } from '@pastweb/vue';
import LoadingPanel from './LoadingPanel.vue';
</script>

<template>
  <AsyncComponent
    :component="() => import('./ProfilePanel.vue')"
    :fallback="LoadingPanel"
    user-id="42"
  />
</template>
```

**Dependency example:**
```vue
<script setup lang="ts">
import { AsyncComponent } from '@pastweb/vue';
import { registerFeatureStore } from '@/stores/features';
import LoadingPanel from './LoadingPanel.vue';
import type { DependencyInfo } from '@pastweb/vue';

const dependencies: DependencyInfo[] = [{
  dependency: () => import('@/stores/profileStore'),
  exportName: 'profileStore',
  onSuccess: store => {
    registerFeatureStore('profile', store);
  },
}];
</script>

<template>
  <AsyncComponent
    :component="() => import('./ProfilePanel.vue')"
    :dependencies="dependencies"
    :fallback="LoadingPanel"
    user-id="42"
  />
</template>
```

### `Remote`

`Remote` loads a micro-frontend Vue module after resolving an optional remote bootstrap dependency or dependency group. It renders `fallback` while loading and `errorFallback` if a dependency or remote module cannot be loaded. It is intentionally separate from `AsyncComponent`, which is designed for local async component loading and SSR task composition.

> #### Syntax

```ts
interface RemoteProps {
  component: () => Promise<{ default: Component }>;
  dependency?: (() => Promise<any>) | Array<() => Promise<any>>;
  fallback?: Content | null;
  errorFallback?: Content | null;
}
```

**Example:**

```vue
<script setup lang="ts">
import { Remote } from '@pastweb/vue';
import LoadingPanel from './LoadingPanel.vue';
import RemoteUnavailable from './RemoteUnavailable.vue';

const dependencies = [
  () => import('reports/bootstrap'),
  () => import('reports/translations'),
];
</script>

<template>
  <Remote
    :component="() => import('reports/App')"
    :dependency="dependencies"
    :fallback="LoadingPanel"
    :error-fallback="RemoteUnavailable"
    locale="en-GB"
  />
</template>
```

### `createEntry`

Creates a browser-side Vue entry object that can mount, hydrate, update, and unmount a Vue application. It supports Vue plugins, component/directive registration, and async wait/fallback configuration.

**Example:**
```ts
import { createEntry } from '@pastweb/vue';
import App from './App.vue';

const entry = createEntry({
  EntryComponent: App,
  querySelector: '#app',
  use: [installApiCache({ queryCache })],
});

entry.mount();
```

### `createServerEntry`

Creates a server-side Vue entry object that renders with Vue SSR and memoizes the result through the tools SSR composition helpers. Use this for server rendering; use `createEntry` for browser mounting and hydration.

> #### Syntax

```ts
function createServerEntry(options?: VueEntryOptions): VueEntry
```

**Example:**
```ts
import { createServerEntry } from '@pastweb/vue';
import App from './App.vue';

const entry = createServerEntry({
  EntryComponent: App,
  initData: {
    title: 'Hello from SSR',
  },
});

const ssrId = entry.mount();
const html = await entry.getComposedSSR();
```

### `EntryAdapter`

`EntryAdapter` renders an entry inside a Vue tree. On the client it mounts the `entry` returned by `createEntry`; on the server it can load a separate `ssrEntry` through the SSR async task queue, keeping the server renderer out of the client bundle.

If your renderer uses the same entry implementation on client and server, omit `ssrEntry`; `EntryAdapter` will use `entry` during SSR too. `ssrEntry` is declared as an adapter prop, so it is not forwarded to the nested entry `initData` or update payload.

**Example:**
```vue
<script setup lang="ts">
import { createEntry, EntryAdapter } from '@pastweb/vue';
import ProfileCard from './ProfileCard.vue';

function createProfileEntry() {
  return createEntry({
    EntryComponent: ProfileCard,
  });
}

const createProfileServerEntry = import.meta.env.SSR
  ? () => import('./profile.server-entry').then(module => module.createProfileServerEntry())
  : undefined;
</script>

<template>
  <EntryAdapter
    :entry="createProfileEntry"
    :ssr-entry="createProfileServerEntry"
    :user-id="userId"
  />
</template>
```

`EntryAdapter` also reads the nearest `Island` context. When rendered inside an `Island`, the nested entry hydrates existing server markup; outside an island it mounts normally.

### `Island`

Hydration-aware component for browser-only or delayed rendering strategies.

**Example:**
```vue
<script setup lang="ts">
import { Island, EntryAdapter } from '@pastweb/vue';
import { createProfileEntry } from './profile.entry';
</script>

<template>
  <Island client="visible" island-id="profile-card">
    <EntryAdapter :entry="createProfileEntry" user-id="123" />
  </Island>
</template>
```

### `portals`

Portal helpers provide portal anchors and render portal content through Vue components and composables. The actual portal lifecycle is powered by `@pastweb/tools`; this package installs the descriptors into Vue dependency injection and exposes Vue-friendly composables/components.

#### `installPortals`

Creates a Vue plugin that provides portal descriptors and anchor ids.

```ts
function installPortals(options: PortalsOptions): {
  install(app: App): void;
}

interface PortalsOptions {
  anchorsIds: PortalAnchorsIds;
  getEntry: (props: Record<string, any>, component: Component | VNode | null) => VueEntry;
  idChahe?: IdCache;
  portalsCache?: Portals;
}
```

**Example:**
```ts
import { createEntry, installPortals, Portal, usePortal } from '@pastweb/vue';

app.use(installPortals({
  anchorsIds: {
    modal: 'modal-root',
  },
  getEntry: (props, component) => createEntry({
    EntryComponent: component,
    initData: props,
  }),
}));
```

#### `usePortals`

Reads the portal descriptor map installed by `installPortals`.

> #### Syntax

```ts
function usePortals<T>(): T;
```

**Example:**
```vue
<script setup lang="ts">
import { usePortals } from '@pastweb/vue';
import type { Portal } from '@pastweb/tools';

type AppPortals = {
  modal: Portal;
  toaster: Portal;
};

const portals = usePortals<AppPortals>();

function scrollToModalAnchor() {
  portals.modal.getPortalElement().scrollIntoView();
}
</script>

<template>
  <button @click="scrollToModalAnchor">
    Show modal anchor
  </button>
</template>
```

#### `usePortalAnchors`

Reads the installed portal anchor ids.

> #### Syntax

```ts
function usePortalAnchors<T>(): T;
```

**Example:**
```vue
<script setup lang="ts">
import { usePortalAnchors } from '@pastweb/vue';

type PortalAnchors = {
  modal: string;
  toaster: string;
};

const anchors = usePortalAnchors<PortalAnchors>();
</script>

<template>
  <div :id="anchors.modal" />
  <div :id="anchors.toaster" />
</template>
```

#### `usePortal`

Creates a portal handler that can be passed to the `Portal` component. Calls made before the component binds the real handler are queued and replayed when the component is ready.

> #### Syntax

```ts
function usePortal(): PortalHandler & { isReady: () => void };
```

**Example:**
```vue
<script setup lang="ts">
import { Portal, usePortal } from '@pastweb/vue';

const modal = usePortal();
</script>

<template>
  <button @click="modal.open()">
    Open modal
  </button>

  <Portal path="modal" :use="modal">
    <Dialog title="Hello from a portal" />
  </Portal>
</template>
```

#### `Portal`

Vue component that connects a `usePortal()` handler to an installed portal path.

> #### Syntax

```ts
interface PortalProps {
  path: string;
  use: PortalHandler & { isReady: () => void };
  manager?: WindowManager;
}
```

**Example:**
```vue
<script setup lang="ts">
import { Portal, usePortal, useWindowManager } from '@pastweb/vue';

const sheet = usePortal();
const manager = useWindowManager();
</script>

<template>
  <button @click="sheet.open()">
    Open sheet
  </button>

  <Portal path="viewSheet" :use="sheet" :manager="manager">
    <Sheet title="Route details" />
  </Portal>
</template>
```

When a manager is supplied, Portal registers the opened entry with it and
unregisters the entry only after the portal handler reports removal. The
manager's close request is forwarded to the portal handler's `close()` method.

### `window manager`

Window Manager helpers make one application-owned `WindowManager` available to
Vue components. The manager itself is created by `@pastweb/tools`; this package
only installs and reads that shared instance.

#### `installWindowManager`

Creates a Vue plugin that provides a manager under the shared Window Manager
context key.

```ts
function installWindowManager(options: WindowManagerOptions): Plugin;

interface WindowManagerOptions {
  manager: WindowManager;
}
```

**Example:**

```ts
import { createApp } from 'vue';
import { createWindowManager } from '@pastweb/tools';
import { installWindowManager } from '@pastweb/vue';

const app = createApp(App);
const manager = createWindowManager();

app.use(installWindowManager({ manager }));
```

#### `useWindowManager`

Reads the nearest installed Window Manager, or returns `undefined` when one was
not installed.

```ts
function useWindowManager(): WindowManager | undefined;
```

**Example:**

```vue
<script setup lang="ts">
import { useWindowManager } from '@pastweb/vue';

const manager = useWindowManager();
</script>

<template>
  <button v-if="manager" @click="manager.closeAll()">Close all windows</button>
</template>
```

### `Render`

Renders primitive content, a Vue VNode, or a component definition with optional props.

> #### Syntax

```ts
type Content = string | number | VNode | Component;

interface RenderProps {
  content: Content;
  props?: Record<string, any>;
}
```

Parameters
* `content`: `Content`
  * String and number values render as text.
  * Vue VNodes are cloned with `props` merged onto the clone.
  * Component definitions are rendered with `props`.
* `props`: `Record<string, any>` _(optional)_
  * Additional props or listeners to apply to VNodes and components. Ignored for primitive content.

**Example:**
```vue
<script setup lang="ts">
import { h } from 'vue';
import { Render } from '@pastweb/vue';

const vnode = h('button', 'Save');
</script>

<template>
  <Render content="Plain text" />
  <Render :content="vnode" :props="{ class: 'primary' }" />
  <Render :content="MyComponent" :props="{ title: 'Hello' }" />
</template>
```

### `Slot`

`Slot` renders a named slot from its owning component with optional prop injection or content mapping. It is useful for component wrappers that need to apply common attributes/listeners to public slot content, or wrap it without forcing callers to repeat markup.

Use `name` to select the public slot to render; it defaults to `default`. `Slot` resolves that slot from the component that owns it, so callers do not need to pass `$slots` manually. If the requested owner slot is absent, it falls back to a matching slot declared directly on `Slot`, then to `Slot`'s default content. `props` are passed to the selected scoped slot. When `map` is omitted, they are also cloned onto the rendered VNode or VNodes. If `map` is provided, it receives each VNode and its index and replaces the cloning step; scoped slot props remain available.

Parameters
* `name`: `string` _(optional)_
  * Public slot name to render. Defaults to `default`.
* `props`: `Record<string, any>` _(optional)_
  * Scoped values passed to the selected slot. Without `map`, they are also cloned as props, classes, attrs, or listeners onto each rendered VNode.
* `map`: `(content: VNode, index: number) => VNode | VNode[]` _(optional)_
  * Transform function for wrapping or replacing each rendered slot VNode; it prevents VNode prop cloning but not scoped slot props.

**Example:**
```vue
<script setup lang="ts">
import { h } from 'vue';
import { Slot } from '@pastweb/vue';

const buttonProps = {
  class: 'toolbar-action',
  onClick: () => console.log('Action clicked'),
};

const wrapContent = (content, index) => h('section', { class: `panel-body panel-${index}` }, content);
</script>

<template>
  <Slot name="title" :props="{ class: 'title' }">
    <h2>Settings</h2>
  </Slot>

  <Slot :props="buttonProps">
    <button>Save</button>
  </Slot>

  <Slot :map="wrapContent" />
</template>
```

---
## Hook functions

### `useBeforeMount`

`useBeforeMount` registers a callback with Vue's `onBeforeMount` lifecycle hook. Use it for setup that should run after `setup()` has registered the component logic but before Vue mounts the component into the DOM.

The callback runs once for each component instance. Async callbacks are accepted, but Vue does not wait for the returned promise before continuing the mount.

> #### Syntax
```ts
function useBeforeMount(fn: () => void | Promise<void>): void
```

Parameters
* `fn`: `() => void | Promise<void>`
  * Callback invoked before the component mounts.

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useBeforeMount } from '@pastweb/vue';

const isRegistered = ref(false);

useBeforeMount(() => {
  registry.register('settings-panel');
  isRegistered.value = true;
});
</script>

<template>
  <section :data-registered="isRegistered">
    Settings
  </section>
</template>
```

### `useBeforeUnmount`

`useBeforeUnmount` registers a callback with Vue's `onBeforeUnmount` lifecycle hook. Use it for cleanup that must run while the component instance is still active, such as removing listeners, closing subscriptions, or flushing pending work.

The callback runs once for each component instance, immediately before Vue unmounts it. Async callbacks are accepted, but Vue does not wait for the returned promise before continuing unmount.

> #### Syntax
```ts
function useBeforeUnmount(fn: () => void | Promise<void>): void
```

Parameters
* `fn`: `() => void | Promise<void>`
  * Callback invoked before the component unmounts.

**Example:**
```vue
<script setup lang="ts">
import { useBeforeUnmount, useMounted } from '@pastweb/vue';

let removeListener: (() => void) | undefined;

useMounted(() => {
  removeListener = bus.on('changed', value => {
    console.log(value);
  });
});

useBeforeUnmount(() => {
  removeListener?.();
});
</script>
```

### `useMediator`

`useMediator` creates a tools mediator inside a Vue component. The mediator is created once for the component instance, while `props` and `extras` are mirrored into tools reactive objects so updates from Vue props stay visible inside mediator methods.

Mediator `state` is copied into Vue shallow reactivity for rendering. This means tools reactive state changes can update Vue templates, while mediator methods and other returned values stay stable for the component lifetime. On unmount, Vue prop/extras watchers are stopped and pending state bridge work is ignored.

Unlike the React package, Vue does not need a render-time mediator store for ordinary rerenders because `setup()` runs once per component instance. Inline mediator state therefore persists across Vue prop updates naturally.

In development, `useMediator` also detects Vite (`import.meta.hot`) and Webpack/Rspack-compatible (`import.meta.webpackHot`) HMR through `@pastweb/tools`. When the mediator source signature changes, the mediator is reinitialized in place and the Vue state mirror is refreshed.

> #### Syntax
```ts
function useMediator<T>(mediator: MediatorFunction<T>, props?: Props, extras?: Extras): T
```

#### Type Parameters
* `T`
  * Mediator return type.

#### Parameters
* `mediator`: `MediatorFunction<T>`
  * Function that creates mediator state and methods.
* `props`: `Props` _(optional)_
  * Values passed to the mediator as reactive props. `children` is ignored.
* `extras`: `Extras` _(optional)_
  * Additional values passed to the mediator as reactive extras.

#### Returns
The mediator return value, with `state` mirrored into Vue rendering.

**Example:**
`counterMediator.ts`

```ts
import { reactive } from '@pastweb/tools';

export function createCounter(props: { initial: number }) {
  const state = reactive({ count: props.initial });

  return {
    state,
    increment() {
      state.count += 1;
    },
  };
}
```

`CounterButton.vue`

```vue
<script setup lang="ts">
import { useMediator } from '@pastweb/vue';
import { createCounter } from './counterMediator';

const counter = useMediator(createCounter, { initial: 0 });
</script>

<template>
  <button @click="counter.increment">
    {{ counter.state.count }}
  </button>
</template>
```

### `useMounted`

`useMounted` registers a callback with Vue's `onMounted` lifecycle hook. Use it for client-side work that needs the component to be mounted, such as reading DOM refs, focusing inputs, or installing browser listeners.

The callback runs once for each component instance. Async callbacks are allowed, but returned promises are not used as cleanup functions.

> #### Syntax
```ts
function useMounted(fn: () => void | Promise<void>): void
```

Parameters
* `fn`: `() => void | Promise<void>`
  * Callback invoked after the component mounts.

**Example:**
```vue
<script setup lang="ts">
import { useMounted, useRef } from '@pastweb/vue';

const input = useRef<HTMLInputElement | null>(null);

useMounted(() => {
  input.value?.focus();
});
</script>

<template>
  <input ref="input" />
</template>
```

### `useRef`

`useRef` creates a Vue `shallowRef`. It gives Vue code the same Pastweb ref helper name used in other framework packages while preserving Vue's normal `.value` access pattern.

Because the ref is shallow, replacing `.value` is reactive, but mutating nested object properties is not deeply tracked by this helper.

> #### Syntax
```ts
function useRef<T>(value?: T): Ref<T | undefined>
```

Parameters
* `value`: `T` _(optional)_
  * Initial value stored in the ref.

**Example:**
```vue
<script setup lang="ts">
import { useRef } from '@pastweb/vue';

const count = useRef(0);

function increment() {
  count.value += 1;
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

---
## Utility functions

### `computed`

Alias for Vue's native `computed` function. It is provided so applications can import `computed` from `@pastweb/vue` alongside the package utilities while keeping the same Vue `ComputedRef` behavior.

> #### Syntax

```ts
function computed<T = unknown>(fn: () => T): ComputedRef<T>
```

**Example:**
```ts
import { ref } from 'vue';
import { computed } from '@pastweb/vue';

const firstName = ref('Ada');
const lastName = ref('Lovelace');

const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

### `useChildren`

`useChildren` reads the active component's default slot children as Vue VNodes. Use it inside `setup()` when writing render-function utilities that need to inspect, wrap, or forward the component's default children.

When the current component has no default slot, it returns an empty array.

> #### Syntax
```ts
function useChildren(): VNode[]
```

**Example:**
```ts
import { h } from 'vue';
import { useChildren } from '@pastweb/vue';

export default {
  setup() {
    const children = useChildren();

    return () => h('section', { class: 'content' }, children);
  },
};
```

### `withDefaultProps`

`withDefaultProps` merges Vue props with defaults and returns a reactive normalized object. Defaults are used only when the incoming prop value is `undefined`; explicit falsy values such as `false`, `0`, and `''` are preserved.

The helper also includes Vue-specific normalization. Vue coerces absent Boolean props to `false` at runtime, which means a defaulting helper cannot tell whether a Boolean prop was omitted or explicitly passed as `false`. For that reason, `booleanChars` lets you model defaulted props as string markers first, then normalize them after defaults are applied. Normalization applies only to keys present in `defaults` and is disabled by default.

A public Vue `class` prop is normalized to a default named `className` by default.

Use `exclude` for defaults that should not be applied by this helper. If the source props object already contains an excluded key, that provided value is preserved; otherwise the excluded default is omitted.

> #### Syntax
```ts
function withDefaultProps<T>(props: Record<string, any>, defaults: Record<string, any>, options?: Options): T

interface Options {
  booleanChars?: false | true | [string, string];
  className?: boolean;
  exclude?: string | RegExp | Array<string | RegExp>;
}
```

Parameters
* `props`: `Record<string, any>`
  * Source Vue props object.
* `defaults`: `Record<string, any>`
  * Defaults applied when a prop is `undefined`.
* `options`: `Options` _(optional)_
* `booleanChars` controls string-to-boolean conversion for Boolean-like default props that need to avoid Vue's absent-Boolean-to-`false` coercion. Omit it, pass `undefined`, or pass `false` to disable conversion. Pass `true` to use `DEFAULT_BOOLEAN_CHARS` (`['true', 'false']`), or a tuple such as `['yes', 'no']` to use custom markers.
  * `className` controls whether the public `class` prop is mapped to a `className` default. Defaults to `true`.
  * `exclude` prevents matching default keys from being applied. Strings match exact keys and regular expressions match the original key from `defaults`.

**Example:**
```vue
<script setup lang="ts">
import { withDefaultProps } from '@pastweb/vue';

const props = defineProps<{
  tone?: 'neutral' | 'accent';
  block?: 'true' | 'false';
  class?: string;
}>();

const p = withDefaultProps<{
  tone: 'neutral' | 'accent';
  block: boolean;
  className: string;
}>(props, {
  tone: 'neutral',
  block: 'false',
  className: 'button',
});
</script>

<template>
  <button :class="p.className" :data-tone="p.tone" :data-block="p.block">
    <slot />
  </button>
</template>
```

**Example With Exclusions:**
```ts
import { withDefaultProps } from '@pastweb/vue';

const p = withDefaultProps(
  props,
  {
    tone: 'neutral',
    debug: false,
    internalFlag: true,
  },
  {
    exclude: ['debug', /^internal/],
  },
);
```

## License

[MIT](./LICENSE) License (c) 2026 [Domenico Pasto](https://github.com/pastweb)
