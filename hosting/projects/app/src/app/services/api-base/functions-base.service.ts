import { inject, Injectable } from "@angular/core";
import { Functions, httpsCallableData } from "@angular/fire/functions";
import { firstValueFrom } from "rxjs";
import { ProgressIndicatorService } from "../progress-indicator.service";

/**
 * Base helper methods for functions api service
 */
@Injectable({
  providedIn: "root",
})
export class FunctionsBaseService {
  protected functions: Functions = inject(Functions);

  constructor(private _baseProgress: ProgressIndicatorService) {}

  protected async baseCall<TReq, TRes>(
    fName: string,
    req: TReq,
  ): Promise<TRes> {
    this._baseProgress.show();

    const callable = httpsCallableData(this.functions, fName);
    const res = await firstValueFrom(callable(req));

    this._baseProgress.hide();
    return res as TRes;
  }
}
