import { cloneDeep } from "lodash";
import { JSONConverterCurrency } from "../../../../rtdb/JSONConverter";
import {
  WCOrderRefundLine,
  WCOrderRefundLineBase,
  WCOrderRefundLineJSON,
} from "./WCOrderRefundLine";
import { WCOrderRefundLineTypeGuard } from "./WCOrderRefundLineTypeGuard";
import { dineroFromString, dineroToString } from "../../../../utils";
import { Currency } from "dinero.js";

/**
 * JSON converter
 */
export const WCOrderRefundLineJSONConverter: JSONConverterCurrency<
  WCOrderRefundLine,
  WCOrderRefundLineJSON
> = {
  toJSON(data: WCOrderRefundLine): WCOrderRefundLineJSON {
    const base: WCOrderRefundLineBase = cloneDeep(data);
    base.total = dineroToString(data.total);
    return base as WCOrderRefundLineJSON;
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderRefundLine {
    if (!WCOrderRefundLineTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderRefundLine.");
    }
    const base: WCOrderRefundLineBase = cloneDeep(json);
    base.total = dineroFromString(json.total as string, currency);
    return base as WCOrderRefundLine;
  },
};
