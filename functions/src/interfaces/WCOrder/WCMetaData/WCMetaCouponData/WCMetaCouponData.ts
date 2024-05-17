import { DateTime } from "luxon";
import { WCMetaData } from "../WCMetaData";
import { WCMetaDateTimeObject } from "../WCMetaDateTimeObject";

/**
 * Data model. Coupon meta data in WC Order.
 * Used when meta data key is "coupon_data".
 */
export interface WCMetaCouponDataBase {
  /**
   * The amount of discount. Should always be numeric, even if setting a percentage.
   */
  amount: string;

  /**
   * Coupon code.
   */
  code: string;

  /**
   * The date the coupon was created, in the site's timezone.
   */
  date_created: DateTime | WCMetaDateTimeObject;

  /**
   * The date the coupon expires, in the site's timezone.
   */
  date_expires?: DateTime | WCMetaDateTimeObject;

  /**
   * The date the coupon was last modified, in the site's timezone.
   */
  date_modified: DateTime | WCMetaDateTimeObject;

  /**
   * Coupon description.
   */
  description: string;

  /**
   * Determines the type of discount that will be applied.
   */
  discount_type: "percent" | "fixed_cart" | "fixed_product";

  /**
   * List of product IDs the coupon cannot be used on.
   */
  excluded_product_ids?: number[];

  /**
   * If true, this coupon will not be applied to items that have sale prices. Default is false.
   */
  exclude_sale_items: boolean;

  /**
   * If true and if the free shipping method requires a coupon, this coupon will enable free shipping. Default is false.
   */
  free_shipping: boolean;

  /**
   * Unique identifier for the object.
   */
  id: number;

  /**
   * If true, the coupon can only be used individually. Other applied coupons will be removed from the cart. Default is false.
   */
  individual_use: boolean;

  /**
   * Max number of items in the cart the coupon can be applied to.
   */
  limit_usage_to_x_items?: number;

  /**
   * Maximum order amount allowed when using the coupon.
   */
  maximum_amount: string;

  /**
   * Meta data.
   */
  meta_data?: WCMetaData[];

  /**
   * Minimum order amount that needs to be in the cart before coupon applies.
   */
  minimum_amount: string;

  /**
   * List of product IDs the coupon can be used on.
   */
  product_ids: number[];

  /**
   * Number of times the coupon has been used already.
   */
  usage_count: number;

  /**
   * How many times the coupon can be used in total.
   */
  usage_limit?: number;

  /**
   * How many times the coupon can be used per customer.
   */
  usage_limit_per_user?: number;

  /**
   * ?
   */
  virtual: boolean;
}

/**
 * Data model. Coupon meta data in WC Order.
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCMetaCouponData extends WCMetaCouponDataBase {
  /**
   * The date the coupon was created, in the site's timezone.
   */
  date_created: DateTime;

  /**
   * The date the coupon expires, in the site's timezone.
   */
  date_expires?: DateTime;

  /**
   * The date the coupon was last modified, in the site's timezone.
   */
  date_modified: DateTime;
}

/**
 * Data model. Coupon meta data in WC Order.
 * Only JSON compatible properties.
 */
export interface WCMetaCouponDataJSON extends WCMetaCouponDataBase {
  date_created: WCMetaDateTimeObject;
  date_expires?: WCMetaDateTimeObject;
  date_modified: WCMetaDateTimeObject;
}
