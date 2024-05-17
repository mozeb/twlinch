import { Dinero } from "dinero.js";

/**
 * Woocommerce order taxes details in various places.
 */
export interface WCOrderTaxesBase {
  /**
   * Unique identifier for the resource.
   */
  id: number;

  /**
   * Subtotal taxes?
   */
  subtotal: Dinero<number> | string;

  /**
   * Total taxes?
   */
  total: Dinero<number> | string;
}

/**
 * Woocommerce order taxes details in various places.
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderTaxes extends WCOrderTaxesBase {
  /**
   * Subtotal taxes?
   */
  subtotal: Dinero<number>;

  /**
   * Total taxes?
   */
  total: Dinero<number>;
}

/**
 * Woocommerce order taxes details in various places.
 * Only JSON compatible properties.
 */
export interface WCOrderTaxesJSON extends WCOrderTaxesBase {
  subtotal: string;
  total: string;
}
