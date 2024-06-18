import { Injectable } from "@angular/core";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { FunctionsBaseService } from "./api-base/functions-base.service";

@Injectable({
  providedIn: "root",
})
export class FunctionsApiService extends FunctionsBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
    console.error(
      "TODO to use this, un-comment 'provideFunctions' in app.config.ts",
    );
  }
}
