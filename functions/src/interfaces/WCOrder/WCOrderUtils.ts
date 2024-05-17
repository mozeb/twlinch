import { WCOrder } from "./WCOrder";
import { find } from "lodash";
import { WCMetaData } from "./WCMetaData";
import { Dinero, subtract } from "dinero.js";
import { dineroFromString, subtractMany } from "../../../utils";
import { WCOrderCouponLine } from "./WCOrderCouponLine";

/**
 * Get meta data value by key from WC Order.
 * Returned value is unknown, must be type checked
 * @param order
 * @param key
 */
export function WCGetOrderMetaDataByKey(
  order: WCOrder | WCOrderCouponLine,
  key: string,
): WCMetaData<unknown> | undefined {
  return find(order.meta_data, (item: WCMetaData<unknown>) => item.key === key);
}

/**
 * Calculate net order value
 * (total - shipping - tax - fees)
 * @param order
 */
export function WCOrderNetValue(order: WCOrder): Dinero<number> {
  let net = subtractMany([order.total, order.shipping_total, order.total_tax]);
  let paypalFee = WCGetOrderMetaDataByKey(order, "_paypal_transaction_fee");
  if (paypalFee === undefined) {
    paypalFee = WCGetOrderMetaDataByKey(order, "PayPal Transaction Fee");
  }
  if (paypalFee !== undefined) {
    net = subtract(
      net,
      dineroFromString(paypalFee.value as string, order.currency),
    );
  }
  return net;
}
