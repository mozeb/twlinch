import { WCOrderCouponLineBase } from "./WCOrderCouponLine";

/**
 * Type guard
 * @param data
 */
export function WCOrderCouponLineTypeGuard(
  data: unknown,
): data is WCOrderCouponLineBase {
  const model = data as WCOrderCouponLineBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.code !== undefined &&
    model.discount !== undefined &&
    model.discount_tax !== undefined &&
    model.id !== undefined
  );
}
