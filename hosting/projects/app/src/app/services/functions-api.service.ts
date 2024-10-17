import { Injectable } from "@angular/core";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { FunctionsBaseService } from "./api-base/functions-base.service";

@Injectable({
  providedIn: "root",
})
export class FunctionsApiService extends FunctionsBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
    console.error();
  }

  async registerDoctor(req: RedeemGiftReq): Promise<ApiCallBase<never>> {
    return this.baseCall<RedeemGiftReq, ApiCallBase<never>>(
      "callredeemgift",
      req,
    );
  }
}

// Interfaces
export interface RedeemGiftReq {
  email: string;
  pass: string;
}

export interface ApiCallBase<T> {
  status: "success" | "error";
  timeNow: string;
  data?: T;
  error?: ApiCallError;
}

export interface ApiCallError {
  message: string;
  err?: unknown;
  data?: unknown;
}
