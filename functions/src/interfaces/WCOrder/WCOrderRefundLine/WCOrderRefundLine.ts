import { Dinero } from "dinero.js";

/**
 * Woocommerce order refund line.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-refunds-properties
 */
export interface WCOrderRefundLineBase {
  /**
   * Refund ID.
   */
  id: number;

  /**
   * Refund reason.
   * @example "Order fully refunded"
   */
  reason: string;

  /**
   * Refund total.
   */
  total: Dinero<number> | string;
}

/**
 * Woocommerce order refund line.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-refunds-properties
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderRefundLine extends WCOrderRefundLineBase {
  /**
   * Refund total.
   */
  total: Dinero<number>;
}

/**
 * Woocommerce order refund line.
 * Only JSON compatible properties.
 */
export interface WCOrderRefundLineJSON extends WCOrderRefundLineBase {
  total: string;
}
