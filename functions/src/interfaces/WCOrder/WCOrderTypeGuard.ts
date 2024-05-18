import { WCOrderBase } from "./WCOrder";

/**
 * Type guard
 * @param data
 */
export function WCOrderTypeGuard(data: unknown): data is WCOrderBase {
  const model = data as WCOrderBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.billing !== undefined &&
    model.cart_hash !== undefined &&
    model.created_via !== undefined &&
    model.currency_symbol !== undefined &&
    model.customer_id !== undefined &&
    model.customer_ip_address !== undefined &&
    model.customer_note !== undefined &&
    model.customer_user_agent !== undefined &&
    model.date_created !== undefined &&
    model.date_created_gmt !== undefined &&
    model.date_modified !== undefined &&
    model.date_modified_gmt !== undefined &&
    model.id !== undefined &&
    model.line_items !== undefined &&
    model.meta_data !== undefined &&
    model.number !== undefined &&
    model.order_key !== undefined &&
    model.parent_id !== undefined &&
    model.payment_method !== undefined &&
    model.payment_method_title !== undefined &&
    model.prices_include_tax !== undefined &&
    model.shipping !== undefined &&
    model.status !== undefined &&
    model.transaction_id !== undefined &&
    model.version !== undefined
  );
}
