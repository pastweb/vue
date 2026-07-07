import { shallowReactive } from 'vue';
import { effect } from '@pastweb/tools/reactivity';
import { useRouter } from '../useRouter';
import type { RouterLinkOptions, RouterLink } from './types';

/**
 * Returns a Vue reactive router-link descriptor for a target route.
 *
 * @param options - Router-link options accepted by tools `getRouterLink`.
 * @returns Reactive link descriptor with `pathname`, active flags, and navigate.
 */
export function useRouterLink(options: RouterLinkOptions): RouterLink {
  const router = useRouter();
  const { path, params, searchParams, hash } = options;
  const link = shallowReactive(router.getRouterLink({
    path,
    params,
    searchParams,
    hash,
  }));

  function setLink() {
    const { path, params, searchParams, hash } = options;
    Object.assign(link, router.getRouterLink({
      path,
      params,
      searchParams,
      hash,
    }));
  }

  effect(setLink, () => router.location.pathname, true);

  return link;
}
