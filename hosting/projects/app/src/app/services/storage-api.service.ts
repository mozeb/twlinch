import { Injectable } from "@angular/core";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { StorageBaseService } from "./api-base/storage-base.service";
import { TwlinchMusicFile } from "../manage_order/upload_music/upload_music.component";
import { get, keys, padStart } from "lodash";

@Injectable({
  providedIn: "root",
})
export class StorageApiService extends StorageBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
    console.error(
      "TODO to use this, un-comment 'provideFunctions' in app.config.ts",
    );
  }

  public async uploadTrackFiles(
    orderNum: string,
    files: {
      [trackSide: string]: TwlinchMusicFile[];
    },
  ) {
    this._progress.show();
    this._progress.changeValue(0);

    const totalSize = this.calculateTotalUploadSize(files);
    let bytesUploaded = 0;

    for (const trackSide of keys(files)) {
      const trackFiles = get(files, trackSide);
      for (let i = 1; i <= trackFiles.length; i++) {
        const file = get(trackFiles, i);
        const path = `/${orderNum}/music/${trackSide}/${trackSide}_${padStart(i.toFixed(0), 2, "0")} - ${file.file.name}`;
        const uploadTask = this.uploadFile(path, file.file);
        uploadTask.on("state_changed", (data) => {
          this._progress.changeValue(
            ((bytesUploaded + data.bytesTransferred) * 100) / totalSize,
          );
        });
        await uploadTask;
        bytesUploaded += file.file.size;
      }
    }
    this._progress.hide();
  }

  calculateTotalUploadSize(files: {
    [trackSide: string]: TwlinchMusicFile[];
  }): number {
    let totalSize: number = 0;
    for (const trackSide of keys(files)) {
      const trackFiles = get(files, trackSide);
      for (const trackFile of trackFiles) {
        totalSize += trackFile.file.size;
      }
    }
    return totalSize;
  }
}
