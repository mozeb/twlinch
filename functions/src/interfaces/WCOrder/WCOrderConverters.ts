import { cloneDeep, map } from "lodash";
import { Currency } from "dinero.js";
import { DateTimeOptions, ToISOTimeOptions } from "luxon";
import {
  currencyFromString,
  dineroFromString,
  dineroToString,
} from "../../../utils";
import {
  dateTimeToString,
  dateTimeToStringUndef,
  JSONConverter,
  stringToDateTime,
  stringToDateTimeUndef,
} from "../../../rtdb";
import { WCOrder, WCOrderBase, WCOrderJSON } from "./WCOrder";
import { WCOrderTypeGuard } from "./WCOrderTypeGuard";
import {
  WCOrderCouponLine,
  WCOrderCouponLineBase,
  WCOrderCouponLineJSONConverter,
} from "./WCOrderCouponLine";
import {
  WCOrderItemLine,
  WCOrderItemLineBase,
  WCOrderItemLineJSONConverter,
} from "./WCOrderItemLine";
import {
  WCOrderRefundLine,
  WCOrderRefundLineBase,
  WCOrderRefundLineJSONConverter,
} from "./WCOrderRefundLine";
import {
  WCOrderShippingLine,
  WCOrderShippingLineBase,
  WCOrderShippingLineJSONConverter,
} from "./WCOrderShippingLine";
import {
  WCOrderTaxLine,
  WCOrderTaxLineBase,
  WCOrderTaxLineJSONConverter,
} from "./WCOrderTaxLine";

const dateTimeToJSONOpts: ToISOTimeOptions = {
  includeOffset: false,
  suppressMilliseconds: true,
};
const dateTimeToDefinedOpts: DateTimeOptions = { setZone: true, zone: "utc" };

/**
 * JSON converter
 */
export const WCOrderJSONConverter: JSONConverter<WCOrder, WCOrderJSON> = {
  toJSON(data: WCOrder): WCOrderJSON {
    const base: WCOrderBase = cloneDeep(data);
    base.cart_tax = dineroToString(data.cart_tax);
    if (data.coupon_lines) {
      base.coupon_lines = map(data.coupon_lines, (item: WCOrderCouponLine) =>
        WCOrderCouponLineJSONConverter.toJSON(item),
      );
    }
    base.currency = data.currency.code;
    base.date_completed = dateTimeToStringUndef(
      data.date_completed,
      dateTimeToJSONOpts,
    );
    base.date_completed_gmt = dateTimeToStringUndef(
      data.date_completed_gmt,
      dateTimeToJSONOpts,
    );
    base.date_created = dateTimeToString(data.date_created, dateTimeToJSONOpts);
    base.date_created_gmt = dateTimeToString(
      data.date_created_gmt,
      dateTimeToJSONOpts,
    );
    base.date_modified = dateTimeToString(
      data.date_modified,
      dateTimeToJSONOpts,
    );
    base.date_modified_gmt = dateTimeToString(
      data.date_modified_gmt,
      dateTimeToJSONOpts,
    );
    base.date_paid = dateTimeToStringUndef(data.date_paid, dateTimeToJSONOpts);
    base.date_paid_gmt = dateTimeToStringUndef(
      data.date_paid_gmt,
      dateTimeToJSONOpts,
    );
    base.discount_tax = dineroToString(data.discount_tax);
    base.discount_total = dineroToString(data.discount_total);
    base.line_items = map(data.line_items, (item: WCOrderItemLine) =>
      WCOrderItemLineJSONConverter.toJSON(item),
    );
    if (data.refunds) {
      base.refunds = map(data.refunds, (item: WCOrderRefundLine) =>
        WCOrderRefundLineJSONConverter.toJSON(item),
      );
    }
    base.shipping_lines = map(
      data.shipping_lines,
      (item: WCOrderShippingLine) =>
        WCOrderShippingLineJSONConverter.toJSON(item),
    );
    base.shipping_tax = dineroToString(data.shipping_tax);
    base.shipping_total = dineroToString(data.shipping_total);
    base.tax_lines = map(data.tax_lines, (item: WCOrderTaxLine) =>
      WCOrderTaxLineJSONConverter.toJSON(item),
    );
    base.total = dineroToString(data.total);
    base.total_tax = dineroToString(data.total_tax);
    return base as WCOrderJSON;
  },
  toDefined(json: unknown): WCOrder {
    if (!WCOrderTypeGuard(json)) {
      throw TypeError("data is not of type WCOrder.");
    }
    const base: WCOrderBase = cloneDeep(json);
    const currency: Currency<number> = currencyFromString(
      json.currency as string,
    );

    base.cart_tax = dineroFromString(json.cart_tax as string, currency);
    if (json.coupon_lines) {
      base.coupon_lines = map(
        json.coupon_lines,
        (item: WCOrderCouponLineBase) =>
          WCOrderCouponLineJSONConverter.toDefined(item, currency),
      );
    }
    base.currency = currency;
    base.date_completed = stringToDateTimeUndef(
      json.date_completed,
      dateTimeToDefinedOpts,
    );
    base.date_completed_gmt = stringToDateTimeUndef(
      json.date_completed_gmt,
      dateTimeToDefinedOpts,
    );
    base.date_created = stringToDateTime(
      json.date_created,
      dateTimeToDefinedOpts,
    );
    base.date_created_gmt = stringToDateTime(
      json.date_created_gmt,
      dateTimeToDefinedOpts,
    );
    base.date_modified = stringToDateTime(
      json.date_modified,
      dateTimeToDefinedOpts,
    );
    base.date_modified_gmt = stringToDateTime(
      json.date_modified_gmt,
      dateTimeToDefinedOpts,
    );
    base.date_paid = stringToDateTimeUndef(
      json.date_paid,
      dateTimeToDefinedOpts,
    );
    base.date_paid_gmt = stringToDateTimeUndef(
      json.date_paid_gmt,
      dateTimeToDefinedOpts,
    );
    base.discount_tax = dineroFromString(json.discount_tax as string, currency);
    base.discount_total = dineroFromString(
      json.discount_total as string,
      currency,
    );
    base.line_items = map(json.line_items, (item: WCOrderItemLineBase) =>
      WCOrderItemLineJSONConverter.toDefined(item, currency),
    );
    if (json.refunds) {
      base.refunds = map(json.refunds, (item: WCOrderRefundLineBase) =>
        WCOrderRefundLineJSONConverter.toDefined(item, currency),
      );
    }
    base.shipping_lines = map(
      json.shipping_lines,
      (item: WCOrderShippingLineBase) =>
        WCOrderShippingLineJSONConverter.toDefined(item, currency),
    );
    base.shipping_tax = dineroFromString(json.shipping_tax as string, currency);
    base.shipping_total = dineroFromString(
      json.shipping_total as string,
      currency,
    );
    base.tax_lines = map(json.tax_lines, (item: WCOrderTaxLineBase) =>
      WCOrderTaxLineJSONConverter.toDefined(item, currency),
    );
    base.total = dineroFromString(json.total as string, currency);
    base.total_tax = dineroFromString(json.total_tax as string, currency);
    return base as WCOrder;
  },
};
