import { cloneDeep } from "lodash";
import { JSONConverterCurrency } from "../../../../rtdb/JSONConverter";
import {
  WCOrderTaxLine,
  WCOrderTaxLineBase,
  WCOrderTaxLineJSON,
} from "./WCOrderTaxLine";
import { WCOrderTaxLineTypeGuard } from "./WCOrderTaxLineTypeGuard";
import { Currency } from "dinero.js";
import { dineroFromString, dineroToString } from "../../../../utils";

/**
 * JSON converter
 */
export const WCOrderTaxLineJSONConverter: JSONConverterCurrency<
  WCOrderTaxLine,
  WCOrderTaxLineJSON
> = {
  toJSON(data: WCOrderTaxLine): WCOrderTaxLineJSON {
    const base: WCOrderTaxLineBase = cloneDeep(data);
    base.tax_total = dineroToString(data.tax_total);
    base.shipping_tax_total = dineroToString(data.shipping_tax_total);
    return base as WCOrderTaxLineJSON;
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderTaxLine {
    if (!WCOrderTaxLineTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderTaxLine.");
    }
    const base: WCOrderTaxLineBase = cloneDeep(json);
    base.tax_total = dineroFromString(json.tax_total as string, currency);
    base.shipping_tax_total = dineroFromString(
      json.shipping_tax_total as string,
      currency,
    );
    return base as WCOrderTaxLine;
  },
};
