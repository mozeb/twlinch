import { DateTime, DateTimeOptions, ToISOTimeOptions } from "luxon";

/**
 * Transform date to string.
 * @param date
 * @param opts
 */
export function dateTimeToString(
  date: DateTime | string,
  opts: ToISOTimeOptions | undefined = undefined,
): string {
  if (typeof date !== "string") {
    date = date.toISO(opts) as string;
  }
  return date;
}

/**
 * Transform date to string. Input can be undefined.
 * @param date
 * @param opts
 */
export function dateTimeToStringUndef(
  date: DateTime | string | undefined,
  opts: ToISOTimeOptions | undefined = undefined,
): string | undefined {
  if (!date) return undefined;
  return dateTimeToString(date, opts);
}

/**
 * Transform string to date.
 * @param date
 * @param opts
 */
export function stringToDateTime(
  date: DateTime | string,
  opts: DateTimeOptions | undefined = { setZone: true },
): DateTime {
  if (typeof date === "string") {
    date = DateTime.fromISO(date, opts);
  }
  return date;
}

/**
 * Transform string to date. Input can be undefined.
 * @param date
 * @param opts
 */
export function stringToDateTimeUndef(
  date: DateTime | string | undefined,
  opts: DateTimeOptions | undefined = { setZone: true },
): DateTime | undefined {
  if (!date) return undefined;
  return stringToDateTime(date, opts);
}
