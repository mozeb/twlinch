import { WCMetaDateTimeObject } from "./WCMetaDateTimeObject";

/**
 * Type guard
 * @param data
 */
export function WCMetaDateTimeObjectTypeGuard(
  data: unknown,
): data is WCMetaDateTimeObject {
  const model = data as WCMetaDateTimeObject;
  if (model === undefined) {
    return false;
  }
  return model.date !== undefined;
}
