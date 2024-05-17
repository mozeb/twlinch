import { cloneDeep } from "lodash";
import { Currency } from "dinero.js";
import { JSONConverterCurrency } from "../../../../rtdb/JSONConverter";
import {
  WCOrderTaxes,
  WCOrderTaxesBase,
  WCOrderTaxesJSON,
} from "./WCOrderTaxes";
import { WCOrderTaxesTypeGuard } from "./WCOrderTaxesTypeGuard";
import { dineroFromString, dineroToString } from "../../../../utils";

/**
 * JSON converter
 */
export const WCOrderTaxesJSONConverter: JSONConverterCurrency<
  WCOrderTaxes,
  WCOrderTaxesJSON
> = {
  toJSON(data: WCOrderTaxes): WCOrderTaxesJSON {
    const base: WCOrderTaxesBase = cloneDeep(data);
    base.subtotal = dineroToString(data.subtotal);
    base.total = dineroToString(data.total);
    return base as WCOrderTaxesJSON;
  },
  toDefined(json: unknown, currency: Currency<number>): WCOrderTaxes {
    if (!WCOrderTaxesTypeGuard(json)) {
      throw TypeError("data is not of type WCOrderTaxes.");
    }
    const base: WCOrderTaxesBase = cloneDeep(json);
    base.subtotal = dineroFromString(json.subtotal as string, currency);
    base.total = dineroFromString(json.total as string, currency);
    return base as WCOrderTaxes;
  },
};
