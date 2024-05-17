import { WCOrderRefundBase } from "./WCOrderRefund";

/**
 * Type guard
 * @param data
 */
export function WCOrderRefundTypeGuard(
  data: unknown,
): data is WCOrderRefundBase {
  const model = data as WCOrderRefundBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.id !== undefined &&
    model.date_created !== undefined &&
    model.date_created_gmt !== undefined &&
    model.amount !== undefined &&
    model.reason !== undefined &&
    model.refunded_by !== undefined &&
    model.refunded_payment !== undefined
  );
}
