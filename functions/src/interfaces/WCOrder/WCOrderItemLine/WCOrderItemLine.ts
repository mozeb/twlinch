import { Dinero } from "dinero.js";
import {
  WCOrderTaxes,
  WCOrderTaxesBase,
  WCOrderTaxesJSON,
} from "../WCOrderTaxes";
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
   * Product price.
   */
  price: Dinero<number> | number;

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
   * Line subtotal (before discounts).
   */
  subtotal: Dinero<number> | string;

  /**
   * Line subtotal tax (before discounts).
   */
  subtotal_tax: Dinero<number> | string;

  /**
   * Line total (after discounts).
   */
  total: Dinero<number> | string;

  /**
   * Line total tax (after discounts).
   */
  total_tax: Dinero<number> | string;

  /**
   * Line taxes. Order - Taxes properties.
   */
  taxes?: WCOrderTaxesBase[];

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
export interface WCOrderItemLine extends WCOrderItemLineBase {
  /**
   * Product price.
   */
  price: Dinero<number>;

  /**
   * Line subtotal (before discounts).
   */
  subtotal: Dinero<number>;

  /**
   * Line subtotal tax (before discounts).
   */
  subtotal_tax: Dinero<number>;

  /**
   * Line total (after discounts).
   */
  total: Dinero<number>;

  /**
   * Line total tax (after discounts).
   */
  total_tax: Dinero<number>;

  /**
   * Line taxes. Order - Taxes properties.
   */
  taxes?: WCOrderTaxes[];
}

/**
 * Woocommerce order item
 * Only JSON compatible properties.
 */
export interface WCOrderItemLineJSON extends WCOrderItemLineBase {
  price: number;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes?: WCOrderTaxesJSON[];
}
