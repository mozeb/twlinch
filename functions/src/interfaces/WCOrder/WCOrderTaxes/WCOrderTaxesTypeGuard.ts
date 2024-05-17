import { WCOrderTaxesBase } from "./WCOrderTaxes";

/**
 * Type guard
 * @param data
 */
export function WCOrderTaxesTypeGuard(data: unknown): data is WCOrderTaxesBase {
  const model = data as WCOrderTaxesBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.id !== undefined &&
    model.subtotal !== undefined &&
    model.total !== undefined
  );
}
