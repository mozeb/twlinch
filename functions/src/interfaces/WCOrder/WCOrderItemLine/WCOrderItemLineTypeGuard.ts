import { WCOrderItemLineBase } from "./WCOrderItemLine";

/**
 * Type guard
 * @param data
 */
export function WCOrderItemLineTypeGuard(
  data: unknown,
): data is WCOrderItemLineBase {
  const model = data as WCOrderItemLineBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.id !== undefined &&
    model.name !== undefined &&
    model.price !== undefined &&
    model.product_id !== undefined &&
    model.variation_id !== undefined &&
    model.quantity !== undefined &&
    model.tax_class !== undefined &&
    model.subtotal !== undefined &&
    model.subtotal_tax !== undefined &&
    model.total !== undefined &&
    model.total_tax !== undefined &&
    model.sku !== undefined
  );
}
