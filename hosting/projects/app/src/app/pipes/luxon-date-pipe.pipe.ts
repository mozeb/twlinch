import { Pipe, PipeTransform } from "@angular/core";
import { DateTime } from "luxon";

@Pipe({
  name: "luxonDate",
  standalone: true,
})
export class LuxonDatePipe implements PipeTransform {
  constructor() {}

  // https://stackoverflow.com/a/68865588
  transform(value: DateTime | Date, format: string = "DATE_SHORT"): any {
    if (value === undefined) {
      return undefined;
    }

    let dateTimeToUse: DateTime;
    if (value instanceof Date) {
      dateTimeToUse = DateTime.fromJSDate(value);
    } else {
      dateTimeToUse = value;
    }

    // This here is enum conversion...
    return dateTimeToUse.toLocaleString((<any>DateTime)[format]);
  }
}
