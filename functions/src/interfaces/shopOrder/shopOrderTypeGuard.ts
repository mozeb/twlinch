import { ShopOrderBase } from "./shopOrder";

/**
 * Type guard
 * @param data
 */
export function shopOrderTypeGuard(data: unknown): data is ShopOrderBase {
  const model = data as ShopOrderBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.wc_order_num !== undefined &&
    model.wc_status !== undefined &&
    model.address_billing !== undefined &&
    model.address_shipping !== undefined &&
    model.customer_note !== undefined &&
    model.paid !== undefined &&
    model.date_created !== undefined &&
    model.item_lines !== undefined
  );
}
