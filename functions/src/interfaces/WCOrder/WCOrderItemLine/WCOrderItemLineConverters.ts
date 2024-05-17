import { cloneDeep, map } from "lodash";
import {
  dineroFromDecimal,
  dineroFromString,
  dineroToDecimal,
  dineroToString,
} from "../../../../utils";
import { JSONConverterCurrency } from "../../../../rtdb/JSONConverter";
import {
  WCOrderItemLine,
  WCOrderItemLineBase,
  WCOrderItemLineJSON,
} from "./WCOrderItemLine";
import { WCOrderItemLineTypeGuard } from "./WCOrderItemLineTypeGuard";
import { Currency } from "dinero.js";
import {
  WCOrderTaxes,
  WCOrderTaxesBase,
  WCOrderTaxesJSONConverter,
} from "../WCOrderTaxes";

/**
 * JSON converter
 */
export const WCOrderItemLineJSONConverter: JSONConverterCurrency<
  WCOrderItemLine,
  WCOrderItemLineJSON
> = {
  toJSON(data: WCOrderItemLine): WCOrderItemLineJSON {
    const base: WCOrderItemLineBase = cloneDeep(data);
    base.price = dineroToDecimal(data.price);
    base.subtotal = dineroToString(data.subtotal);
    base.subtotal_tax = dineroToString(data.subtotal_tax);
    base.total = dineroToString(data.total);
    base.total_tax = dineroToString(data.total_tax);
    if (data.taxes) {
      base.taxes = map(data.taxes, (item: WCOrderTaxes) =>
        WCOrderTaxesJSONConverter.toJSON(item),
      );
    }
    return base as WCOrderItemLineJSON;
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderItemLine {
    if (!WCOrderItemLineTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderItemLine.");
    }
    const base: WCOrderItemLineBase = cloneDeep(json);
    base.price = dineroFromDecimal(json.price as number, currency);
    base.subtotal = dineroFromString(json.subtotal as string, currency);
    base.subtotal_tax = dineroFromString(json.subtotal_tax as string, currency);
    base.total = dineroFromString(json.total as string, currency);
    base.total_tax = dineroFromString(json.total_tax as string, currency);
    if (json.taxes) {
      base.taxes = map(json.taxes, (item: WCOrderTaxesBase) =>
        WCOrderTaxesJSONConverter.toDefined(item, currency),
      );
    }
    return base as WCOrderItemLine;
  },
};
