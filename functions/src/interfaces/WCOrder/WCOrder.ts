import { DateTime } from "luxon";
import { Currency, Dinero } from "dinero.js";
import { WCOrderBilling } from "./WCOrderBilling";
import {
  WCOrderCouponLine,
  WCOrderCouponLineBase,
  WCOrderCouponLineJSON,
} from "./WCOrderCouponLine";
import { WCOrderShipping } from "./WCOrderShipping";
import { WCOrderStatus } from "./WCOrderStatus";
import {
  WCOrderTaxLine,
  WCOrderTaxLineBase,
  WCOrderTaxLineJSON,
} from "./WCOrderTaxLine";
import {
  WCOrderRefundLine,
  WCOrderRefundLineBase,
  WCOrderRefundLineJSON,
} from "./WCOrderRefundLine";
import {
  WCOrderItemLine,
  WCOrderItemLineBase,
  WCOrderItemLineJSON,
} from "./WCOrderItemLine";
import { WCMetaData } from "./WCMetaData";
import {
  WCOrderShippingLine,
  WCOrderShippingLineBase,
  WCOrderShippingLineJSON,
} from "./WCOrderShippingLine";

/**
 * Woocommerce Order properties.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#orders
 */
export interface WCOrderBase {
  /**
   * Woocommerce provided urls.
   */
  _links?: { self: { href: string }[]; collection: { href: string }[] };

  /**
   * Billing address. Order - Billing properties.
   * @see WCOrderBillingProperties
   */
  billing: WCOrderBilling;

  /**
   * MD5 hash of cart items to ensure orders are not modified.
   * @example "0e342d3194af48fab0a807efa986ef48"
   */
  cart_hash: string;

  /**
   * Sum of line item taxes only.
   * @example "47.60"
   */
  cart_tax: Dinero<number> | string;

  /**
   * Coupons line data. Order - Coupon lines properties.
   */
  coupon_lines?: WCOrderCouponLineBase[];

  /**
   * Shows where the order was created.
   * @example "checkout"
   */
  created_via: string;

  /**
   * Currency the order was created with, in ISO format.
   * @example "USD", "EUR", ...
   */
  currency: Currency<number> | string;

  /**
   * Currency symbol the order was created with.
   * @example "$", "€"
   */
  currency_symbol: string;

  /**
   * User ID who owns the order. 0 for guests. Default is 0.
   */
  customer_id: number;

  /**
   * Customer's IP address.
   */
  customer_ip_address: string;

  /**
   * Note left by customer during checkout.
   */
  customer_note: string;

  /**
   * User agent of the customer.
   */
  customer_user_agent: string;

  /**
   * The date the order was completed, in the site's timezone.
   */
  date_completed?: DateTime | string;

  /**
   * The date the order was completed, as GMT.
   */
  date_completed_gmt?: DateTime | string;

  /**
   * The date the order was created, in the site's timezone.
   */
  date_created: DateTime | string;

  /**
   * The date the order was created, as GMT.
   */
  date_created_gmt: DateTime | string;

  /**
   * The date the order was last modified, in the site's timezone.
   */
  date_modified: DateTime | string;

  /**
   * The date the order was last modified, as GMT.
   */
  date_modified_gmt: DateTime | string;

  /**
   * The date the order was paid, in the site's timezone.
   */
  date_paid?: DateTime | string;

  /**
   * The date the order was paid, as GMT.
   */
  date_paid_gmt?: DateTime | string;

  /**
   * Total discount tax amount for the order.
   */
  discount_tax: Dinero<number> | string;

  /**
   * Total discount amount for the order.
   */
  discount_total: Dinero<number> | string;

  /**
   * Fee lines data. Order - Fee lines properties.
   * Interface not implemented, because it's not used.
   */
  fee_lines?: never[];

  /**
   * Unique identifier for the resource.
   */
  id: number;

  /**
   * Line items data. Order - Line items properties.
   */
  line_items: WCOrderItemLineBase[];

  /**
   * Meta data. Order - Meta data properties.
   */
  meta_data: WCMetaData<string | unknown>[];

  /**
   * Order number.
   */
  number: string;

  /**
   * Order key.
   * @example "wc_order_NrFAQOJuiD7iS"
   */
  order_key: string;

  /**
   * Parent order ID.
   * Normally 0.
   */
  parent_id: number;

  /**
   * Payment method ID.
   * @example "braintree_credit_card", "ppec_paypal", "paypal"
   */
  payment_method: string;

  /**
   * Payment method title.
   * @example "Credit Card", "PayPal"
   */
  payment_method_title: string;

  /**
   * True the prices included tax during checkout.
   */
  prices_include_tax: boolean;

  /**
   * List of refunds. Order - Refunds properties.
   */
  refunds?: WCOrderRefundLineBase[];

  /**
   * Shipping address. Order - Shipping properties.
   */
  shipping: WCOrderShipping;

  /**
   * Shipping lines data. Order - Shipping lines properties.
   */
  shipping_lines: WCOrderShippingLineBase[];

  /**
   * Total shipping tax amount for the order.
   * @example "1.08"
   */
  shipping_tax: Dinero<number> | string;

  /**
   * Total shipping amount for the order.
   * @example "4.92"
   */
  shipping_total: Dinero<number> | string;

  /**
   * Order status.
   * @example "pending", "processing", "completed", "failed", ...
   */
  status: WCOrderStatus;

  /**
   * Tax lines data. Order - Tax lines properties.
   */
  tax_lines: WCOrderTaxLineBase[];

  /**
   * Grand total.
   * @example "269.99"
   */
  total: Dinero<number> | string;

  /**
   * Sum of all taxes.
   * @example "33.36"
   */
  total_tax: Dinero<number> | string;

  /**
   * Unique transaction ID.
   * @example "9181vkhd", "8VL07707F45883237"
   */
  transaction_id: string;

  /**
   * Version of WooCommerce which last updated the order.
   * @example "3.8.1", "5.9.0"
   */
  version: string;
}

/**
 * Woocommerce Order properties.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#orders
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrder extends WCOrderBase {
  /**
   * Sum of line item taxes only.
   * @example "47.60"
   */
  cart_tax: Dinero<number>;

  /**
   * Coupons line data. Order - Coupon lines properties.
   */
  coupon_lines?: WCOrderCouponLine[];

  /**
   * Currency the order was created with, in ISO format.
   * @example "USD", "EUR", ...
   */
  currency: Currency<number>;

  /**
   * The date the order was completed, in the site's timezone.
   */
  date_completed?: DateTime;

  /**
   * The date the order was completed, as GMT.
   */
  date_completed_gmt?: DateTime;

  /**
   * The date the order was created, in the site's timezone.
   */
  date_created: DateTime;

  /**
   * The date the order was created, as GMT.
   */
  date_created_gmt: DateTime;

  /**
   * The date the order was last modified, in the site's timezone.
   */
  date_modified: DateTime;

  /**
   * The date the order was last modified, as GMT.
   */
  date_modified_gmt: DateTime;

  /**
   * The date the order was paid, in the site's timezone.
   */
  date_paid?: DateTime;

  /**
   * The date the order was paid, as GMT.
   */
  date_paid_gmt?: DateTime;

  /**
   * Total discount tax amount for the order.
   */
  discount_tax: Dinero<number>;

  /**
   * Total discount amount for the order.
   */
  discount_total: Dinero<number>;

  /**
   * Line items data. Order - Line items properties.
   */
  line_items: WCOrderItemLine[];

  /**
   * List of refunds. Order - Refunds properties.
   */
  refunds?: WCOrderRefundLine[];

  /**
   * Shipping lines data. Order - Shipping lines properties.
   */
  shipping_lines: WCOrderShippingLine[];

  /**
   * Total shipping tax amount for the order.
   * @example "1.08"
   */
  shipping_tax: Dinero<number>;

  /**
   * Total shipping amount for the order.
   * @example "4.92"
   */
  shipping_total: Dinero<number>;

  /**
   * Tax lines data. Order - Tax lines properties.
   */
  tax_lines: WCOrderTaxLine[];

  /**
   * Grand total.
   * @example "269.99"
   */
  total: Dinero<number>;

  /**
   * Sum of all taxes.
   * @example "33.36"
   */
  total_tax: Dinero<number>;
}

/**
 * Woocommerce Order properties.
 * Only JSON compatible properties.
 */
export interface WCOrderJSON extends WCOrderBase {
  cart_tax: string;
  coupon_lines?: WCOrderCouponLineJSON[];
  currency: string;
  date_completed?: string;
  date_completed_gmt?: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  date_paid?: string;
  date_paid_gmt?: string;
  discount_tax: string;
  discount_total: string;
  line_items: WCOrderItemLineJSON[];
  refunds?: WCOrderRefundLineJSON[];
  shipping_lines: WCOrderShippingLineJSON[];
  shipping_tax: string;
  shipping_total: string;
  tax_lines: WCOrderTaxLineJSON[];
  total: string;
  total_tax: string;
}
