import { inject, Injectable } from "@angular/core";
import {
  deleteObject,
  listAll,
  ref as refStorage,
  Storage,
  uploadBytes,
  UploadResult,
  getDownloadURL,
} from "@angular/fire/storage";
import { ProgressIndicatorService } from "../progress-indicator.service";
import { NotifyService } from "../notify.service";
import { FirebaseError } from "@angular/fire/app";
import { isFirebaseDataSnapshot } from "@angular/fire/compat/database/utils";
import { ListResult } from "@angular/fire/compat/storage/interfaces";

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

  public getStorageDownloadLink(path: string) {
    const ref = refStorage(this.storage, path);
    return getDownloadURL(ref);
  }

  public async deleteFolder(path: string): Promise<void> {
    const ref = refStorage(this.storage, path);
    const filesAtRef = await listAll(ref);
    //
    for (const item of filesAtRef.items) {
      try {
        await deleteObject(item);
      } catch (e) {
        this.handleError(e as Error, "deleteFolder");
      }
    }
  }

  public async getFileName(path: string): Promise<Array<string>> {
    const ref = refStorage(this.storage, path);
    const fileName: Array<string> = [];
    const filesAtRef = await listAll(ref);
    //
    for (const item of filesAtRef.items) {
      try {
        await fileName.push(item.name.substring(7));
      } catch (e) {
        this.handleError(e as Error, "getFilesNames");
      }
    }
    return fileName;
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
