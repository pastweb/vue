export { installApiCache } from './installApiCache';
export { reuseMutation, reuseQuery, useApiQueryCache, useInfiniteQuery, useMutation, useQueries, useQuery } from './hooks';

export type { ApiCacheOptions, ApiCachePlugin } from './installApiCache';
export type { ApiQuerySnapshot } from './types';
export type {
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
} from './hooks';
