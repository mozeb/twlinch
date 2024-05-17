import { DateTime } from "luxon";
import { WCMetaData } from "../WCMetaData";
import { WCOrderItemLineBase } from "../WCOrderItemLine";
import { Dinero } from "dinero.js";

/**
 * Woocommerce Order refund properties.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-refund-properties
 */
export interface WCOrderRefundBase {
  /**
   * Unique identifier for the resource.
   */
  id: number;

  /**
   * The date the order refund was created, in the site's timezone.
   */
  date_created: DateTime | string;

  /**
   * The date the order refund was created, as GMT.
   */
  date_created_gmt: DateTime | string;

  /**
   * Total refund amount. Optional. If this parameter is provided,
   * it will take precedence over line item totals,
   * even when total of line items does not matches with this amount.
   */
  amount: Dinero<number> | string;

  /**
   * Reason for refund.
   */
  reason: string;

  /**
   * User ID of user who created the refund.
   */
  refunded_by: number;

  /**
   * If the payment was refunded via the API. See api_refund.
   */
  refunded_payment: boolean;

  /**
   * Meta data.
   */
  meta_data: WCMetaData<unknown>[];

  /**
   * Line items data. See Order refund - Line items properties
   */
  line_items: WCOrderItemLineBase[];

  /**
   * When true, the payment gateway API is used to generate the refund. Default is true.
   */
  api_refund?: boolean;
}

/**
 * Woocommerce Order refund properties.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-refund-properties
 * Properties are converted to their respectable classes.
 * Use only when primary object is passed through appropriate converter.
 */
export interface WCOrderRefund extends WCOrderRefundBase {
  /**
   * The date the order refund was created, in the site's timezone.
   */
  date_created: DateTime;

  /**
   * The date the order refund was created, as GMT.
   */
  date_created_gmt: DateTime;

  /**
   * Total refund amount. Optional. If this parameter is provided,
   * it will take precedence over line item totals,
   * even when total of line items does not matches with this amount.
   */
  amount: Dinero<number>;
}

/**
 * Woocommerce Order refund properties.
 * @link https://woocommerce.github.io/woocommerce-rest-api-docs/#order-refund-properties
 * Only JSON compatible properties.
 */
export interface WCOrderRefundJSON extends WCOrderRefundBase {
  date_created: string;
  date_created_gmt: string;
  amount: string;
}
