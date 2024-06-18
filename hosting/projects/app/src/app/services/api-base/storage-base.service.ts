import { inject, Injectable } from "@angular/core";
import { Storage, ref } from "@angular/fire/storage";
import { firstValueFrom } from "rxjs";
import { ProgressIndicatorService } from "../progress-indicator.service";

@Injectable({
  providedIn: "root",
})
export class DatabaseBaseService {
  protected storage: Storage = inject(Storage);

  constructor(private _baseProgress: ProgressIndicatorService) {}

  // public async uploadFiles<T>(path: string): Promise<T> {
  //   this._baseProgress.show();
  //
  //   const dbRef = ref(this.rtdb, path);
  //   const json = await firstValueFrom(objectVal<T>(dbRef));
  //
  //   this._baseProgress.hide();
  //   return json;
  // }
}
