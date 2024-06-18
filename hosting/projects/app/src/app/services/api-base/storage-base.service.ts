import { inject, Injectable } from "@angular/core";
import {
  deleteObject,
  listAll,
  ref as refStorage,
  Storage,
  uploadBytes,
  UploadResult,
} from "@angular/fire/storage";
import { ProgressIndicatorService } from "../progress-indicator.service";
import { NotifyService } from "../notify.service";
import { FirebaseError } from "@angular/fire/app";

@Injectable({
  providedIn: "root",
})
export class StorageBaseService {
  protected storage: Storage = inject(Storage);

  constructor(
    private _baseProgress: ProgressIndicatorService,
    private _baseNotify: NotifyService,
  ) {}

  public uploadFile(path: string, file: File): Promise<UploadResult> {
    const ref = refStorage(this.storage, path);
    return uploadBytes(ref, file);
  }

  public async deleteFolder(path: string): Promise<void> {
    const ref = refStorage(this.storage, path);

    // TODO Write recursive function to crawl over folder, get all refs, and then delete all with Promise.all() ?
    //
    // const filesAtRef = await listAll(ref);
    //
    // for (const item of filesAtRef.items) {
    //   item.
    // }

    try {
      await deleteObject(ref);
    } catch (e) {
      this.handleError(e as Error, "deleteFolder");
    }
  }

  private handleError(error: any, method: string): void {
    if (!error.code) {
      console.error(`Not Firebase error. err: ${error}`);
      this._baseNotify.update(error.message, "error");
      return;
    }

    const fe = error as FirebaseError;
    console.log(fe.code, fe.message);
    switch (fe.code) {
      /// ######## Storage ######## - https://firebase.google.com/docs/storage/web/handle-errors#handle_error_messages
      case "storage/object-not-found":
        // No object exists at the desired reference.
        if (method === "deleteFolder") {
          // All ok
          break;
        }
        console.error(fe);
        break;
      default:
        console.error(`Unknown error. Code: "${fe.code}"`);
        break;
    }
  }
}
