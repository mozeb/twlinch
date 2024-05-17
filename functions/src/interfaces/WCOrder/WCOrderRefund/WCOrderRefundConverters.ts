import { cloneDeep } from "lodash";
import {
  dineroFromString,
  dineroToString,
  removeEmpty,
} from "../../../../utils";
import {
  WCOrderRefund,
  WCOrderRefundBase,
  WCOrderRefundJSON,
} from "./WCOrderRefund";
import { WCOrderRefundTypeGuard } from "./WCOrderRefundTypeGuard";
import {
  dateTimeToString,
  JSONConverterCurrency,
  stringToDateTime,
} from "../../../../rtdb";
import { Currency } from "dinero.js";
import { DateTimeOptions, ToISOTimeOptions } from "luxon";

const dateTimeToJSONOpts: ToISOTimeOptions = {
  includeOffset: false,
  suppressMilliseconds: true,
};
const dateTimeToDefinedOpts: DateTimeOptions = { setZone: true, zone: "utc" };

/**
 * JSON converter
 */
export const WCOrderRefundJSONConverter: JSONConverterCurrency<
  WCOrderRefund,
  WCOrderRefundJSON
> = {
  toJSON(data: WCOrderRefund): WCOrderRefundJSON {
    const base: WCOrderRefundBase = cloneDeep(data);
    base.date_created = dateTimeToString(base.date_created, dateTimeToJSONOpts);
    base.date_created_gmt = dateTimeToString(
      base.date_created_gmt,
      dateTimeToJSONOpts,
    );
    base.amount = dineroToString(data.amount);
    return removeEmpty(base);
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderRefund {
    if (!WCOrderRefundTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderRefund.");
    }
    const base: WCOrderRefundBase = cloneDeep(json);
    base.date_created = stringToDateTime(
      base.date_created,
      dateTimeToDefinedOpts,
    );
    base.date_created_gmt = stringToDateTime(
      base.date_created_gmt,
      dateTimeToDefinedOpts,
    );
    base.amount = dineroFromString(base.amount as string, currency);
    return base as WCOrderRefund;
  },
};
