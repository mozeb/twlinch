import { DateTime } from "luxon";
import { JSONConverter } from "../../../../../rtdb/JSONConverter";
import { WCMetaDateTimeObject } from "./WCMetaDateTimeObject";
import { WCMetaDateTimeObjectTypeGuard } from "./WCMetaDateTimeObjectTypeGuard";

/**
 * JSON converter
 */
export const WCMetaDateTimeObjectJSONConverter: JSONConverter<
  DateTime,
  WCMetaDateTimeObject
> = {
  toJSON(data: DateTime): WCMetaDateTimeObject {
    return {
      date: data.toFormat("yyyy-LL-dd HH:mm:ss.000000"),
      timezone: "+00:00",
      timezone_type: 1,
    } as WCMetaDateTimeObject;
  },
  toDefined(json: unknown): DateTime {
    if (!WCMetaDateTimeObjectTypeGuard(json)) {
      throw TypeError("data is not of type WCMetaDateTimeObject.");
    }
    return DateTime.fromFormat(json.date, "yyyy-LL-dd HH:mm:ss.000000");
  },
};
