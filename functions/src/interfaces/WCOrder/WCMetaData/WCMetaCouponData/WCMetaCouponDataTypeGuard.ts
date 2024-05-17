import { WCMetaCouponDataBase } from "./WCMetaCouponData";

/**
 * Type guard
 * @param data
 */
export function WCMetaCouponDataTypeGuard(
  data: unknown,
): data is WCMetaCouponDataBase {
  const model = data as WCMetaCouponDataBase;
  if (model === undefined) {
    return false;
  }
  return (
    model.amount !== undefined &&
    model.code !== undefined &&
    model.discount_type !== undefined &&
    model.id !== undefined &&
    model.free_shipping !== undefined
  );
}
