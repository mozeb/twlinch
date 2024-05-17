import { cloneDeep } from "lodash";
import { JSONConverter } from "../../../../../rtdb/JSONConverter";
import {
  WCMetaCouponData,
  WCMetaCouponDataBase,
  WCMetaCouponDataJSON,
} from "./WCMetaCouponData";
import { WCMetaCouponDataTypeGuard } from "./WCMetaCouponDataTypeGuard";
import { WCMetaDateTimeObjectJSONConverter } from "../WCMetaDateTimeObject";

/**
 * JSON converter
 */
export const WCMetaCouponDataJSONConverter: JSONConverter<
  WCMetaCouponData,
  WCMetaCouponDataJSON
> = {
  toJSON(data: WCMetaCouponData): WCMetaCouponDataJSON {
    const base: WCMetaCouponDataBase = cloneDeep(data);
    base.date_created = WCMetaDateTimeObjectJSONConverter.toJSON(
      data.date_created,
    );
    if (data.date_expires) {
      base.date_expires = WCMetaDateTimeObjectJSONConverter.toJSON(
        data.date_expires,
      );
    }
    base.date_modified = WCMetaDateTimeObjectJSONConverter.toJSON(
      data.date_modified,
    );
    return base as WCMetaCouponDataJSON;
  },
  toDefined(json: unknown): WCMetaCouponData {
    if (!WCMetaCouponDataTypeGuard(json)) {
      throw TypeError("data is not of type WCMetaCouponData.");
    }
    const base: WCMetaCouponDataBase = cloneDeep(json);
    base.date_created = WCMetaDateTimeObjectJSONConverter.toDefined(
      base.date_created,
    );
    if (base.date_expires) {
      base.date_expires = WCMetaDateTimeObjectJSONConverter.toDefined(
        base.date_expires,
      );
    }
    base.date_modified = WCMetaDateTimeObjectJSONConverter.toDefined(
      base.date_modified,
    );
    return base as WCMetaCouponData;
  },
};
