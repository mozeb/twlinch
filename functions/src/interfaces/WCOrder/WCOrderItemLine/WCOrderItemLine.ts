import { WCMetaData } from "../WCMetaData";

/**
 * Woocommerce order item
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-line-items-properties
 */
export interface WCOrderItemLineBase {
  /**
   * Item ID.
   */
  id: number;

  /**
   * Product name.
   * @example "AmblyoPlay STANDARD 6-Month Access"
   */
  name: string;

  /**
   * Product ID.
   */
  product_id: number;

  /**
   * Variation ID, if applicable.
   */
  variation_id: number;

  /**
   * Quantity ordered.
   */
  quantity: number;

  /**
   * Slug of the tax class of product.
   * @example "digital-products"
   */
  tax_class: string;

  /**
   * Meta data. Order - Meta data properties.
   */
  meta_data?: WCMetaData[];

  /**
   * Product SKU.
   * @example "amblyoplay-6-month-access-prepaid"
   */
  sku: string;
}

/**
 * Woocommerce order item
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-line-items-properties
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderItemLine extends WCOrderItemLineBase {}

/**
 * Woocommerce order item
 * Only JSON compatible properties.
 */
export interface WCOrderItemLineJSON extends WCOrderItemLineBase {}
