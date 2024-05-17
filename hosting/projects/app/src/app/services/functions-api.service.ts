import { Injectable } from "@angular/core";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { FunctionsBaseService } from "./api-base/functions-base.service";
import {
  StartSomethingSpecialReq,
  StartSomethingSpecialRes,
} from "../../../../../../shared-interfaces";

@Injectable({
  providedIn: "root",
})
export class FunctionsApiService extends FunctionsBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
  }

  startSomethingSpecial(
    req: StartSomethingSpecialReq,
  ): Promise<StartSomethingSpecialRes> {
    return this.baseCall("startsomethingspecial", req);
  }
}
