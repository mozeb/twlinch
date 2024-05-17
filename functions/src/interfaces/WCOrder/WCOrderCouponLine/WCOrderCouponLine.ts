import {
  WCMetaCouponData,
  WCMetaCouponDataBase,
  WCMetaCouponDataJSON,
  WCMetaData,
} from "../WCMetaData";
import { Dinero } from "dinero.js";

/**
 * Woocommerce Order Coupon Line.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-coupon-lines-properties
 */
export interface WCOrderCouponLineBase {
  /**
   * Coupon code.
   * @example "15off"
   */
  code: string;

  /**
   * Discount total.
   * @example "27.77"
   */
  discount: Dinero<number> | string;

  /**
   * Discount total tax.
   * @example "5.12"
   */
  discount_tax: Dinero<number> | string;

  /**
   * Item ID.
   * @example 21
   */
  id: number;

  /**
   * Meta data. Order - Meta data properties.
   * Meta key = "coupon_data"
   */
  meta_data: WCMetaData<WCMetaCouponDataBase>[];
}

/**
 * Woocommerce Order Coupon Line.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-coupon-lines-properties
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderCouponLine extends WCOrderCouponLineBase {
  /**
   * Discount total.
   * @example "27.77"
   */
  discount: Dinero<number>;

  /**
   * Discount total tax.
   * @example "5.12"
   */
  discount_tax: Dinero<number>;

  /**
   * Meta data. Order - Meta data properties.
   * Meta key = "coupon_data"
   */
  meta_data: WCMetaData<WCMetaCouponData>[];
}

/**
 * Woocommerce Order Coupon Line.
 * Only JSON compatible properties.
 */
export interface WCOrderCouponLineJSON extends WCOrderCouponLineBase {
  discount: string;
  discount_tax: string;
  meta_data: WCMetaData<WCMetaCouponDataJSON>[];
}
