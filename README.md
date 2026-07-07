# @pastweb/vue

Vue integration package for building tools-powered Vue applications.

It provides Vue-specific bindings for the framework-agnostic primitives in `@pastweb/tools`: API/query composables, router integration, entry composition, portals, rendering helpers, context helpers, lifecycle utilities, and Vue utility composables. Use it as a standalone Vue utility layer or as part of a larger Pastweb-based stack.

## Features

- **Tools-first architecture** - Vue composables and components wrap the core `@pastweb/tools` functionality instead of replacing it.
- **API/query integration** - Vue wrappers for query cache access, `useQuery`, `useMutation`, `useQueries`, `useInfiniteQuery`, and reusable query state.
- **Router integration** - Vue components and composables for `createViewRouter`.
- **Entry composition** - Vue entry helpers for mounting, updating, plugins, components, directives, and async waits.
- **Portal support** - Vue components and composables for portal descriptors and anchors.
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
- **Element functions** - Entry rendering, islands, portals, slots, and UI composition helpers.
- **Hook functions** - Vue lifecycle and mediator composables.
- **Utility functions** - Small Vue utilities such as `Render`, `computed`, `useRef`, `getEventHandlers`, `withDefaultProps`, and `withDefaultPropsHandlers`.

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
  - [useColorScheme](#usecolorscheme)
- [Routing](#routing)
  - [createRouter](#createrouter)
  - [RouterView](#routerview)
  - [RouterLink](#routerlink)
  - [useLocation](#uselocation)
  - [useNavigate](#usenavigate)
  - [usePaths](#usepaths)
  - [useRoute](#useroute)
  - [useRouter](#userouter)
  - [useRouterLink](#userouterlink)
  - [useSearchParams](#usesearchparams)
- [Element functions](#element-functions)
  - [createEntry](#createentry)
  - [createServerEntry](#createserverentry)
  - [EntryAdapter](#entryadapter)
  - [Island](#island)
  - [portals](#portals)
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
  - [getEventHandlers](#geteventhandlers)
  - [withDefaultPropsHandlers](#withdefaultpropshandlers)

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

### `useColorScheme`

Vue composable for color-scheme state from `@pastweb/tools`. Pass options to create an internal `MatchScheme`, or pass a pre-created `MatchScheme` as the second argument.

> #### Syntax

```ts
function useColorScheme(options?: SchemeOptions, matchScheme?: MatchScheme): [ColorSchemeInfo, (mode: string) => void]
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

### `createRouter`

Creates a Vue plugin for a tools `ViewRouter`. It provides the router under the shared tools router context key, initializes route depth for nested `RouterView` components, and registers `RouterView` and `RouterLink` globally.

> #### Syntax

```ts
function createRouter(router: ViewRouter): Plugin;
```

**Example:**
```ts
import { createViewRouter, type Route } from '@pastweb/tools/createViewRouter';
import { createRouter, RouterView } from '@pastweb/vue';

const router = createViewRouter({
  routes: routes as Route[],
  RouterView,
});

app.use(createRouter(router));
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
## Element functions

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
import type { Portal } from '@pastweb/tools/portals';

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
}
```

**Example:**
```vue
<script setup lang="ts">
import { Portal, usePortal } from '@pastweb/vue';

const sheet = usePortal();
</script>

<template>
  <button @click="sheet.open()">
    Open sheet
  </button>

  <Portal path="viewSheet" :use="sheet">
    <Sheet title="Route details" />
  </Portal>
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

`Slot` renders one of its own Vue slots by name, with optional prop injection or content mapping. It is useful for small composition wrappers where the component chooses which slot to display, applies common attributes/listeners to the rendered VNodes, or wraps slot output without forcing callers to repeat markup.

When `name` is omitted, `Slot` renders the default slot. When a named slot is requested but not provided, it falls back to the default slot. If `props` are provided, the rendered VNode or VNodes are cloned with those props. If `map` is provided, it receives the slot content and its return value is rendered instead; `map` takes precedence over `props`.

Parameters
* `name`: `string` _(optional)_
  * Slot name to render. Defaults to `default`.
* `props`: `Record<string, any>` _(optional)_
  * Props, classes, attrs, or listeners cloned onto each rendered slot VNode.
* `map`: `(content: VNode | VNode[]) => VNode | VNode[]` _(optional)_
  * Transform function for wrapping or replacing the rendered slot content.

**Example:**
```vue
<script setup lang="ts">
import { h } from 'vue';
import { Slot } from '@pastweb/vue';

const buttonProps = {
  class: 'toolbar-action',
  onClick: () => console.log('Action clicked'),
};

const wrapContent = content => h('section', { class: 'panel-body' }, content);
</script>

<template>
  <Slot name="title">
    <template #title>
      <h2>Settings</h2>
    </template>
  </Slot>

  <Slot :props="buttonProps">
    <button>Save</button>
  </Slot>

  <Slot :map="wrapContent">
    <p>Mapped default content.</p>
  </Slot>
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

The helper also includes Vue-specific normalization. Vue coerces absent Boolean props to `false` at runtime, which means a defaulting helper cannot tell whether a Boolean prop was omitted or explicitly passed as `false`. For that reason, `booleanChars` lets you model those props as string markers first, then normalize them after defaults are applied. By default, `+` becomes `true` and `-` becomes `false`.

A default named `className` is exposed as Vue's `class` prop by default.

Use `exclude` for defaults that should not be applied by this helper. If the source props object already contains an excluded key, that provided value is preserved; otherwise the excluded default is omitted.

> #### Syntax
```ts
function withDefaultProps<T>(props: Record<string, any>, defaults: Record<string, any>, options?: Options): T

interface Options {
  booleanChars?: [string, string];
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
  * `booleanChars` controls string-to-boolean conversion for Boolean-like props that need to avoid Vue's absent-Boolean-to-`false` coercion. Defaults to `['+', '-']`.
  * `className` controls whether `className` defaults are mapped to `class`. Defaults to `true`.
  * `exclude` prevents matching default keys from being applied. Strings match exact keys and regular expressions match the original key from `defaults`.

**Example:**
```vue
<script setup lang="ts">
import { withDefaultProps } from '@pastweb/vue';

const props = defineProps<{
  tone?: 'neutral' | 'accent';
  block?: '+' | '-';
  className?: string;
}>();

const p = withDefaultProps<{
  tone: 'neutral' | 'accent';
  block: boolean;
  class: string;
}>(props, {
  tone: 'neutral',
  block: '-',
  className: 'button',
});
</script>

<template>
  <button :class="p.class" :data-tone="p.tone" :data-block="p.block">
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

### `getEventHandlers`

`getEventHandlers` extracts Vue-style handler props into an object that can be passed to `v-on`. Handler props must start with `on` followed by an uppercase character, such as `onClick`, `onChange`, or `onUpdateModelValue`. Regular props such as `online` or `once` are ignored.

The returned event names are lower kebab case after removing the `on` prefix, so `onClick` becomes `click` and `onUpdateModelValue` becomes `update-model-value`.

> #### Syntax
```ts
function getEventHandlers(
  props: Record<string, any>,
  options?: Options,
): Record<string, Function>

interface Options {
  exclude?: string | RegExp | Array<string | RegExp>;
}
```

Parameters
* `props`: `Record<string, any>`
  * Source object containing regular props and handler props.
* `options`: `Options` _(optional)_
  * `exclude` removes matching extracted event names. Strings match exact event names and regular expressions match the kebab-cased event name.

Returns
* `Record<string, Function>`
  * Event map ready for `v-on`.

**Example:**
```vue
<script setup lang="ts">
import { getEventHandlers } from '@pastweb/vue';

const props = defineProps<{
  title?: string;
  online?: () => void;
  onClick?: () => void;
  onUpdateModelValue?: (value: string) => void;
}>();

const events = getEventHandlers(props, {
  exclude: 'update-model-value',
});
</script>

<template>
  <button v-on="events">
    {{ props.title }}
  </button>
</template>
```

### `withDefaultPropsHandlers`

`withDefaultPropsHandlers` combines `withDefaultProps` with event-handler extraction. It returns normalized props for `v-bind` and a separate event map for `v-on`, which is useful for wrapper components that forward both props and listeners.

Event handler props are detected only when the prop name starts with `on` followed by an uppercase character, such as `onClick`, `onChange`, or `onUpdateModelValue`. This keeps regular props such as `online` or `once` from being removed from the normalized props object.

> #### Syntax
```ts
function withDefaultPropsHandlers<T>(
  props: Record<string, any>,
  defaults: Record<string, any>,
  options?: Options,
): [T, Record<string, Function>]

interface Options {
  booleanChars?: [string, string];
  className?: boolean;
  excludeProps?: string | RegExp | Array<string | RegExp>;
  excludeHandlers?: string | RegExp | Array<string | RegExp>;
}
```

Parameters
* `props`: `Record<string, any>`
  * Source Vue props object.
* `defaults`: `Record<string, any>`
  * Defaults applied to regular props and default handlers.
* `options`: `Options` _(optional)_
  * `booleanChars` and `className` are passed to `withDefaultProps`.
  * `excludeProps` excludes keys from default merging.
  * `excludeHandlers` excludes extracted event names after removing `on` and converting to kebab case.

Returns
* `[T, Record<string, Function>]`
  * Normalized props and extracted event handlers.

**Example:**
```vue
<script setup lang="ts">
import { withDefaultPropsHandlers } from '@pastweb/vue';

const props = defineProps<{
  tone?: 'neutral' | 'accent';
  block?: '+' | '-';
  online?: () => void;
  onClick?: () => void;
  onUpdateModelValue?: (value: string) => void;
}>();

const [p, events] = withDefaultPropsHandlers<{
  tone: 'neutral' | 'accent';
  block: boolean;
  online: () => void;
}>(props, {
  tone: 'neutral',
  block: '-',
  online: () => {},
  onClick: () => {},
  onUpdateModelValue: () => {},
});
</script>

<template>
  <button v-bind="p" v-on="events">
    <slot />
  </button>
</template>
```

## License

[MIT](./LICENSE) License (c) 2026 [Domenico Pasto](https://github.com/pastweb)
