import { cloneDeep, map } from "lodash";
import { dineroFromString, dineroToString } from "../../../../utils";
import { JSONConverterCurrency } from "../../../../rtdb/JSONConverter";
import {
  WCOrderCouponLine,
  WCOrderCouponLineBase,
  WCOrderCouponLineJSON,
} from "./WCOrderCouponLine";
import { WCOrderCouponLineTypeGuard } from "./WCOrderCouponLineTypeGuard";
import {
  WCMetaCouponData,
  WCMetaCouponDataBase,
  WCMetaCouponDataJSONConverter,
  WCMetaData,
} from "../WCMetaData";
import { Currency } from "dinero.js";

/**
 * JSON converter
 */
export const WCOrderCouponLineJSONConverter: JSONConverterCurrency<
  WCOrderCouponLine,
  WCOrderCouponLineJSON
> = {
  toJSON(data: WCOrderCouponLine): WCOrderCouponLineJSON {
    const base: WCOrderCouponLineBase = cloneDeep(data);

    base.discount = dineroToString(data.discount);
    base.discount_tax = dineroToString(data.discount_tax);

    // Convert meta data
    if (data.meta_data) {
      base.meta_data = map(
        data.meta_data,
        (item: WCMetaData<WCMetaCouponData>) => {
          const itemBase: WCMetaData<WCMetaCouponDataBase> = cloneDeep(item);
          if (item.key === "coupon_data") {
            itemBase.value = WCMetaCouponDataJSONConverter.toJSON(item.value);
          }
          if (
            item.display_key === "coupon_data" &&
            item.display_value !== undefined
          ) {
            itemBase.display_value = WCMetaCouponDataJSONConverter.toJSON(
              item.display_value,
            );
          }
          return itemBase;
        },
      );
    }

    return base as WCOrderCouponLineJSON;
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderCouponLine {
    if (!WCOrderCouponLineTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderCouponLine.");
    }
    const base: WCOrderCouponLineBase = cloneDeep(json);

    base.discount = dineroFromString(json.discount as string, currency);
    base.discount_tax = dineroFromString(json.discount_tax as string, currency);

    // Convert meta data
    if (json.meta_data) {
      base.meta_data = map(
        json.meta_data,
        (item: WCMetaData<WCMetaCouponDataBase>) => {
          const itemBase: WCMetaData<WCMetaCouponDataBase> = cloneDeep(item);
          if (item.key === "coupon_data") {
            itemBase.value = WCMetaCouponDataJSONConverter.toDefined(
              item.value,
            );
          }
          if (
            item.display_key === "coupon_data" &&
            item.display_value !== undefined
          ) {
            itemBase.display_value = WCMetaCouponDataJSONConverter.toDefined(
              item.display_value,
            );
          }
          return itemBase;
        },
      );
    }

    return base as WCOrderCouponLine;
  },
};
