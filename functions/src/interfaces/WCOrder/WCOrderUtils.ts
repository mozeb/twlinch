import { WCOrder } from "./WCOrder";
import { find } from "lodash";
import { WCMetaData } from "./WCMetaData";

/**
 * Get meta data value by key from WC Order.
 * Returned value is unknown, must be type checked
 * @param order
 * @param key
 */
export function WCGetOrderMetaDataByKey(
  order: WCOrder,
  key: string,
): WCMetaData<unknown> | undefined {
  return find(order.meta_data, (item: WCMetaData<unknown>) => item.key === key);
}
