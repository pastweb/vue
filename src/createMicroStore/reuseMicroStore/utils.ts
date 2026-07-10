import type {
  MicroStoreActions,
  VueMicroStore,
  VueMicroStoreSelector,
} from './types';

function readSnapshot(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return value;

  seen.add(value);

  return Object.keys(value).map(key => readSnapshot((value as Record<string, unknown>)[key], seen));
}

export function getStoreSnapshot<
  S extends Record<string, any>,
  A extends MicroStoreActions,
  T,
>(
  store: VueMicroStore<S, A>,
  selector?: VueMicroStoreSelector<T, S>,
): unknown {
  const result = selector ? store(selector) : store();

  return readSnapshot(result.state);
}

export function createRenderableState<T>(state: T): Readonly<T> {
  if (!state || typeof state !== 'object') return state as Readonly<T>;

  return new Proxy(state as object, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },
  }) as Readonly<T>;
}
