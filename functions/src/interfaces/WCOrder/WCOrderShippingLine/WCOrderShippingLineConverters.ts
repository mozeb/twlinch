import { cloneDeep, map } from "lodash";
import { JSONConverterCurrency } from "../../../../rtdb/JSONConverter";
import {
  WCOrderShippingLine,
  WCOrderShippingLineBase,
  WCOrderShippingLineJSON,
} from "./WCOrderShippingLine";
import { WCOrderShippingLineTypeGuard } from "./WCOrderShippingLineTypeGuard";
import { dineroFromString, dineroToString } from "../../../../utils";
import { Currency } from "dinero.js";
import {
  WCOrderTaxes,
  WCOrderTaxesBase,
  WCOrderTaxesJSONConverter,
} from "../WCOrderTaxes";

/**
 * JSON converter
 */
export const WCOrderShippingLineJSONConverter: JSONConverterCurrency<
  WCOrderShippingLine,
  WCOrderShippingLineJSON
> = {
  toJSON(data: WCOrderShippingLine): WCOrderShippingLineJSON {
    const base: WCOrderShippingLineBase = cloneDeep(data);
    base.total = dineroToString(data.total);
    base.total_tax = dineroToString(data.total_tax);
    base.taxes = map(data.taxes, (item: WCOrderTaxes) =>
      WCOrderTaxesJSONConverter.toJSON(item),
    );
    return base as WCOrderShippingLineJSON;
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderShippingLine {
    if (!WCOrderShippingLineTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderShippingLine.");
    }
    const base: WCOrderShippingLineBase = cloneDeep(json);
    base.total = dineroFromString(json.total as string, currency);
    base.total_tax = dineroFromString(json.total_tax as string, currency);
    base.taxes = map(json.taxes, (item: WCOrderTaxesBase) =>
      WCOrderTaxesJSONConverter.toDefined(item, currency),
    );
    return base as WCOrderShippingLine;
  },
};
