import { forEach, keys } from "lodash";

/**
 * Recursively remove all null or undefined parameters from object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function removeEmpty(obj: any, keepNull = false): any {
  forEach(keys(obj), (key) => {
    if (obj[key] && typeof obj[key] === "object")
      removeEmpty(obj[key], keepNull);
    else if (obj[key] === undefined) delete obj[key];
    else if (obj[key] === null && !keepNull) delete obj[key];
  });
  return obj;
}
