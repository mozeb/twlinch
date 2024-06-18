import { inject, Injectable } from "@angular/core";
import {
  ref as refStorage,
  Storage,
  uploadBytesResumable,
  UploadTask,
} from "@angular/fire/storage";
import { ProgressIndicatorService } from "../progress-indicator.service";

@Injectable({
  providedIn: "root",
})
export class StorageBaseService {
  protected storage: Storage = inject(Storage);

  constructor(private _baseProgress: ProgressIndicatorService) {}

  public uploadFile(path: string, file: File): UploadTask {
    const ref = refStorage(this.storage, path);
    return uploadBytesResumable(ref, file);
  }
}
