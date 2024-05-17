import { WCOrderTaxLineBase } from "./WCOrderTaxLine";

/**
 * Type guard
 * @param data
 */
export function WCOrderTaxLineTypeGuard(
  data: unknown,
): data is WCOrderTaxLineBase {
  const model = data as WCOrderTaxLineBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.id !== undefined &&
    model.rate_code !== undefined &&
    model.rate_id !== undefined &&
    model.label !== undefined &&
    model.compound !== undefined &&
    model.tax_total !== undefined &&
    model.shipping_tax_total !== undefined
  );
}
