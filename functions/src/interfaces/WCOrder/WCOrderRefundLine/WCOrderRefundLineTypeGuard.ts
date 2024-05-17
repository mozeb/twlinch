import { WCOrderRefundLineBase } from "./WCOrderRefundLine";

/**
 * Type guard
 * @param data
 */
export function WCOrderRefundLineTypeGuard(
  data: unknown,
): data is WCOrderRefundLineBase {
  const model = data as WCOrderRefundLineBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.id !== undefined &&
    model.reason !== undefined &&
    model.total !== undefined
  );
}
