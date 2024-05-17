import { WCMetaData } from "../WCMetaData";
import { Dinero } from "dinero.js";

/**
 * Woocommerce order tax line
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-tax-lines-properties
 */
export interface WCOrderTaxLineBase {
  /**
   * Item ID.
   */
  id: number;

  /**
   * Tax rate code.
   * @example "SI- TAX-1", "US-VAT-1", "CA-VAT-1"
   */
  rate_code: string;

  /**
   * Tax rate ID.
   */
  rate_id: number;

  /**
   * Tax rate in percents.
   */
  rate_percent: number;

  /**
   * Tax rate label.
   * @example "Tax", "VAT"
   */
  label: string;

  /**
   * Show if is a compound tax rate.
   */
  compound: boolean;

  /**
   * Tax total (not including shipping taxes).
   */
  tax_total: Dinero<number> | string;

  /**
   * Shipping tax total.
   */
  shipping_tax_total: Dinero<number> | string;

  /**
   * Meta data. Order - Meta data properties.
   */
  meta_data?: WCMetaData[];
}

/**
 * Woocommerce order tax line
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-tax-lines-properties
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderTaxLine extends WCOrderTaxLineBase {
  /**
   * Tax total (not including shipping taxes).
   */
  tax_total: Dinero<number>;

  /**
   * Shipping tax total.
   */
  shipping_tax_total: Dinero<number>;
}

/**
 * Woocommerce order tax line
 * Only JSON compatible properties.
 */
export interface WCOrderTaxLineJSON extends WCOrderTaxLineBase {
  tax_total: string;
  shipping_tax_total: string;
}
