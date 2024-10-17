import { DateTime } from "luxon";
import { ShopItemLineBase } from "./shopItemLine";
import { WCOrderBilling, WCOrderShipping, WCOrderStatus } from "../WCOrder";
import {
  OrderAddOns,
  OrderProcess,
  twDesignStatus,
  twRecordingStatus,
} from "../../https/woocommerce";

/**
 * Data model. Shop order data.
 */
export interface ShopOrderBase {
  /**
   * Woocommerce order number
   */
  wc_order_num: string;

  /**
   * Order status.
   * @example "pending", "processing", "completed", "failed", ...
   */
  wc_status: WCOrderStatus;

  /**
   * Billing address. Order - Billing properties.
   * @see WCOrderBillingProperties
   */
  address_billing: WCOrderBilling;

  /**
   * Shipping address. Order - Shipping properties.
   */
  address_shipping: WCOrderShipping;

  /**
   * Note left by customer during checkout.
   */
  customer_note: string;

  /**
   * Is the order paid?
   */
  paid: boolean;

  /**
   * The date the order was created, in the UTC zone.
   */
  date_created: DateTime | string;

  /**
   * The date the order was completed, in the UTC zone.
   */
  date_completed?: DateTime | string;

  /**
   * Line items data. Order - Line items properties.
   */
  item_lines: ShopItemLineBase[];

  auth_uid?: string;

  order_process?: OrderProcess;

  order_add_ons?: OrderAddOns;

  tw_design_order_status?: twDesignStatus;

  tw_recording_order_status?: twRecordingStatus;

  isGift?: boolean;
}

/**
 * Data model. Shop order data.
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface ShopOrder extends ShopOrderBase {
  /**
   * The date the order was created, in the site's timezone.
   */
  date_created: DateTime;

  /**
   * The date the order was completed, in the site's timezone.
   */
  date_completed?: DateTime;
}

/**
 * Data model. Shop order data.
 * Only JSON compatible properties.
 */
export interface ShopOrderJSON extends ShopOrderBase {
  date_created: string;
  date_completed?: string;
}
