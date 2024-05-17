import { Dinero } from "dinero.js";
import {
  WCOrderTaxes,
  WCOrderTaxesBase,
  WCOrderTaxesJSON,
} from "../WCOrderTaxes";
import { WCMetaData } from "../WCMetaData";

/**
 * Woocommerce order shipping line.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-shipping-lines-properties
 */
export interface WCOrderShippingLineBase {
  /**
   * Item ID.
   */
  id: number;

  /**
   * Shipping method name.
   * @example "DHL Fast Shipping (FREE)", "Free DHL Fast Shipping"
   */
  method_title: string;

  /**
   * Shipping method ID.
   * @example "free_shipping", "flat_rate"
   */
  method_id: string;

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
   * Unknown
   */
  instance_id?: string;
}

/**
 * Woocommerce order shipping line.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-shipping-lines-properties
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderShippingLine extends WCOrderShippingLineBase {
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
 * Woocommerce order shipping line.
 * Only JSON compatible properties.
 */
export interface WCOrderShippingLineJSON extends WCOrderShippingLineBase {
  total: string;
  total_tax: string;
  taxes?: WCOrderTaxesJSON[];
}
