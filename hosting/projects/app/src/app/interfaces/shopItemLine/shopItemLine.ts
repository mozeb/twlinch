/**
 * Data model. Shop order item line.
 */
export interface ShopItemLineBase {
  /**
   * Woocommerce item ID.
   */
  wc_id: number;

  /**
   * Product name.
   * @example "AmblyoPlay STANDARD 6-Month Access"
   */
  name: string;

  /**
   * Woocommerce product ID.
   */
  wc_product_id: number;

  /**
   * Variation ID, if applicable.
   */
  wc_variation_id: number;

  /**
   * Quantity ordered.
   */
  quantity: number;

  /**
   * Product SKU.
   * @example "amblyoplay-6-month-access-prepaid"
   */
  sku: string;
}

/**
 * Data model. Shop order item line.
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface ShopItemLine extends ShopItemLineBase {}

/**
 * Data model. Shop order item line.
 * Only JSON compatible properties.
 */
export interface ShopItemLineJSON extends ShopItemLineBase {}
