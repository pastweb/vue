export { computed } from './computed';

export {
  installApiCache,
  reuseMutation,
  reuseQuery,
  useApiQueryCache,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
} from './api';
export type {
  ApiCacheOptions,
  ApiCachePlugin,
  ApiQuerySnapshot,
  InfiniteQueryConfig,
  InfiniteQueryInfo,
  InfiniteQueryInitialData,
  MutationConfig,
  MutationInfo,
  QueriesData,
  QueriesInfo,
  QueryConfig,
  QueryDataFromConfig,
  QueryFetchStatus,
  QueryInfo,
  QueryStatus,
  RetryDelayOption,
  RetryOption,
  UseQueriesConfig,
  UseQueriesInfo,
  UseQueriesInput,
} from './api';

export { AsyncComponent } from './AsyncComponent';
export type {
  AsyncComponentProps,
  ComponentModule,
  Dependency,
  DependencyInfo,
} from './AsyncComponent';

export { Remote } from './Remote';
export type { RemoteDependency, RemoteModule, RemoteProps } from './Remote';

export { createEntry, createServerEntry } from './createEntry';
export type {
  Component,
  VueEntry,
  VueEntryOptions,
  ComponentDescriptor,
  PluginDescriptor,
  Register,
} from './createEntry';

export { reuseColorScheme, useColorScheme } from './useColorScheme';

export { createMicroStore, reuseMicroStore } from './createMicroStore';
export type {
  MicroStore,
  MicroStoreActions,
  MicroStoreActionsContext,
  MicroStoreConfig,
  ReuseMicroStoreHook,
  ReuseMicroStoreResult,
  Selector,
  UseMicroStore,
  VueMicroStore,
  VueMicroStoreSelector,
  VueUseMicroStore,
} from './createMicroStore';

export { EntryAdapter } from './EntryAdapter';

export { getContext } from './getContext';

export { invokeEventHandlers } from './invokeEventHandlers';

export { Island, useIsland } from './Island';
export type { ClientStrategy, IslandDefaultProps, IslandProps } from './Island';

export {
  installPortals,
  usePortals,
  usePortalAnchors,
  Portal,
  usePortal,
} from './portals';
export type { PortalFunction, PortalProps, EntryDescriptor } from './portals';

export { Render, type Content, type RenderProps } from './Render';

export {
  RouterLink,
  RouterView,
  installRouter,
  useLocation,
  useNavigate,
  useRoute,
  useRouter,
  usePaths,
  useRouterLink,
  useSearchParams,
} from './router';
export type {
  Route,
  AuthFunction,
  RouterOptions,
  ViewComponent,
  ViewRouter,
} from './router';

export { setContext } from './setContext';

export { installWindowManager, useWindowManager } from './windowManager';
export type { WindowManagerOptions } from './windowManager';

export { Slot, type SlotProps } from './Slot';

export { useBeforeMount } from './useBeforeMount';
export { useBeforeUnmount } from './useBeforeUnmount';
export { useChildren } from './useChildren';

export { useMediator } from './useMediator';
export type { ContextUtils, Mediator, MediatorFunction } from './useMediator';

export { reuseMatchDevice, useMatchDevice } from './useMatchDevice';
export type { DevicesConfig, DevicesResult } from './useMatchDevice';

export { useMounted } from './useMounted';
export { useRef } from './useRef';

export { withDefaultProps, type WithDefaultPropsOptions } from './withDefaultProps';
