import { ShopOrder, ShopOrderBase, ShopOrderJSON } from "./shopOrder";
import { shopOrderTypeGuard } from "./shopOrderTypeGuard";
import { WCOrder } from "../WCOrder";
import { ShopItemLine } from "./shopItemLine";
import {
  dateTimeToString,
  dateTimeToStringUndef,
  stringToDateTime,
  stringToDateTimeUndef,
} from "../typeConverters";
import { cloneDeep } from "lodash";
import { JSONConverter } from "../JSONConverter";
import { removeEmpty } from "../removeEmpty";

/**
 * JSON converter
 */
export const shopOrderJSONConverter: JSONConverter<ShopOrder, ShopOrderJSON> = {
  toJSON(data: ShopOrder): ShopOrderJSON {
    const base: ShopOrderBase = cloneDeep(data);
    base.date_created = dateTimeToString(data.date_created);
    base.date_completed = dateTimeToStringUndef(data.date_completed);
    return removeEmpty(base);
  },
  toDefined(json: unknown): ShopOrder {
    if (!shopOrderTypeGuard(json)) {
      throw TypeError("json is not of type ShopOrder.");
    }
    const base: ShopOrderBase = cloneDeep(json);
    base.date_created = stringToDateTime(json.date_created);
    base.date_completed = stringToDateTimeUndef(json.date_completed);
    return base as ShopOrder;
  },
};

/**
 * Woocommerce to shopOrder converter.
 */
export const shopOrderWCOrderConverter = {
  async toDefined(order: WCOrder): Promise<ShopOrder> {
    // items
    const item_lines: ShopItemLine[] = [];
    for (const line_item of order.line_items) {
      const item: ShopItemLine = {
        wc_id: line_item.id,
        name: line_item.name,
        wc_product_id: line_item.product_id,
        wc_variation_id: line_item.variation_id,
        quantity: line_item.quantity,
        sku: line_item.sku,
      };
      item_lines.push(item);
    }

    return {
      address_billing: order.billing,
      address_shipping: order.shipping,
      customer_note: order.customer_note,
      date_completed: order.date_completed_gmt,
      date_created: order.date_created_gmt,
      item_lines: item_lines,
      paid: order.date_paid_gmt !== undefined,
      wc_order_num: order.number,
      wc_status: order.status,
    };
  },
};
