import { shallowReactive, watch } from 'vue';
import { useLocation } from '../useLocation';
import { useRouter } from '../useRouter';

/**
 * Returns URL search params for the current router location.
 *
 * @returns Reactive object with current params and the router `setSearchParams`
 * method.
 */
export function useSearchParams(): {
  params: URLSearchParams;
  setSearchParams: (searchParams: URLSearchParams) => void;
} {
  const router = useRouter();
  const location = useLocation();
  
  const searchParams = shallowReactive({
    params: location.searchParams,
    setSearchParams: router.setSearchParams,
  });

  watch(
    () => location.searchParams,
    () => { searchParams.params = location.searchParams; }
  );

  return searchParams;
}
