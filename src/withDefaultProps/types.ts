/**
 * Options controlling Vue prop default normalization.
 */
export interface WithDefaultPropsOptions {
  /**
   * String pair converted to boolean `true` and `false`.
   *
   * Useful because Vue coerces absent Boolean props to `false`, so string
   * markers preserve the difference between "unset" and "explicit false" until
   * defaults have been applied. Normalization is applied only to keys declared
   * in the defaults object. Set to `true` to use `DEFAULT_BOOLEAN_CHARS`, a
   * tuple to use custom markers, or `false`/`undefined` to disable it.
   */
  booleanChars?: false | true | [string, string];
  /** When true, maps Vue's `class` prop to a default key named `className`. */
  className?: boolean;
  /**
   * Keys to exclude from default merging.
   * Can be a string, RegExp, or array of both.
   * Applied to the original key name from the `defaults` object.
   */
  exclude?: string | RegExp | Array<string | RegExp>;
};
