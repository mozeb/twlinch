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
  }

  public async uploadTrackFiles(
    orderNum: string,
    files: {
      [trackSide: string]: TwlinchMusicFile[];
    },
  ) {
    this._progress.show();
    this._progress.updateDonePercent(0);

    const totalSize = this.calculateTotalUploadSize(files);
    let bytesUploaded = 0;

    for (const trackSide of keys(files)) {
      const trackFiles = get(files, trackSide);
      console.log(`Starting side ${trackSide}. Items: ${trackFiles.length}`);
      for (let i = 0; i < trackFiles.length; i++) {
        const file = get(trackFiles, i);
        this._progress.updateBufferPercent(
          ((bytesUploaded + file.file.size) * 100) / totalSize,
        );
        const path = `/${orderNum}/music/${trackSide}/${trackSide}_${padStart((i + 1).toFixed(0), 2, "0")} - ${file.file.name}`;
        await this.uploadFile(path, file.file);
        bytesUploaded += file.file.size;
        this._progress.updateDonePercent((bytesUploaded * 100) / totalSize);
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
