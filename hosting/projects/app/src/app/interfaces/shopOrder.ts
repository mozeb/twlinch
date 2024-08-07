import { DateTime } from "luxon";
import { ShopItemLineBase } from "./shopItemLine";
import { OrderProcess } from "../services/interfaces";

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
  wc_status: string;

  /**
   * Billing address. Order - Billing properties.
   * @see WCOrderBillingProperties
   */
  address_billing: WCOrderBilling;

  /**
   * Shipping address. Order - Shipping properties.
   */
  address_shipping: string;

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

  order_process: OrderProcess;

  artworkZip: string;

  musicZip: string;
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

export interface WCOrderBilling {
  /**
   * Address line 1.
   */
  address_1: string;

  /**
   * Address line 2.
   */
  address_2: string;

  /**
   * City name.
   */
  city: string;

  /**
   * Company name.
   */
  company: string;

  /**
   * Country code in ISO 3166-1 alpha-2 format.
   */
  country: string;

  /**
   * Email address.
   */
  email: string;

  /**
   * First name.
   */
  first_name: string;

  /**
   * Last name.
   */
  last_name: string;

  /**
   * Phone number.
   */
  phone: string;

  /**
   * Postal code.
   */
  postcode: string;

  /**
   * ISO code or name of the state, province or district.
   */
  state: string;
}
