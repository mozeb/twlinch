/**
 * Woocommerce Order Meta data.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-meta-data-properties
 */
export interface WCMetaData<T = string> {
  /**
   * Meta ID.
   */
  id: number;

  /**
   * Meta key.
   */
  key: string;

  /**
   * Meta value.
   */
  value: T;

  /**
   * Display meta key for UI.
   */
  display_key?: string;

  /**
   * Display meta value for UI.
   */
  display_value?: T;
}
