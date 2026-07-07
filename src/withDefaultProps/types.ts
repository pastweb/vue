/**
 * Options controlling Vue prop default normalization.
 */
export interface WithDefaultPropsOptions {
  /**
   * String pair converted to boolean `true` and `false`.
   *
   * Useful because Vue coerces absent Boolean props to `false`, so string
   * markers preserve the difference between "unset" and "explicit false" until
   * defaults have been applied. Defaults to `['+', '-']`.
   */
  booleanChars?: [string, string];
  /** When true, maps a default key named `className` to Vue's `class` prop. */
  className?: boolean;
  /**
   * Keys to exclude from default merging.
   * Can be a string, RegExp, or array of both.
   * Applied to the original key name from the `defaults` object.
   */
  exclude?: string | RegExp | Array<string | RegExp>;
};
