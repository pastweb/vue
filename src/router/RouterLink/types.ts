import type { RouterLinkOptions } from '@pastweb/tools/createViewRouter/types';

/** Props for the Vue `RouterLink` component. */
export type RouterLinkProps = RouterLinkOptions & {
  /** Optional CSS class applied to the rendered anchor. */
  className?: string;

  /** When true, click events do not call router navigation. */
  preventNavigate?: boolean;
};
