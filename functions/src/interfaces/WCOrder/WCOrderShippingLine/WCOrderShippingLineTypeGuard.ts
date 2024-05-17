import { WCOrderShippingLineBase } from "./WCOrderShippingLine";

/**
 * Type guard
 * @param data
 */
export function WCOrderShippingLineTypeGuard(
  data: unknown,
): data is WCOrderShippingLineBase {
  const model = data as WCOrderShippingLineBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.id !== undefined &&
    model.method_title !== undefined &&
    model.method_id !== undefined &&
    model.total !== undefined &&
    model.total_tax !== undefined
  );
}
