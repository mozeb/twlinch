import { Injectable } from "@angular/core";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { StorageBaseService } from "./api-base/storage-base.service";
import { TwlinchMusicFile } from "../manage_order/upload_music/upload_music.component";
import { get, keys, padStart } from "lodash";
import { AuthService } from "./auth.service";
import { NotifyService } from "./notify.service";
import { PreviewFile } from "../popups/desing-preview-popup/design-preview-popup.component";

@Injectable({
  providedIn: "root",
})
export class StorageApiService extends StorageBaseService {
  constructor(
    private _progressService: ProgressIndicatorService,
    private _authService: AuthService,
    private _notifyService: NotifyService,
  ) {
    super(_progressService, _notifyService);
  }

  public async getFilesNames(files: {
    [trackSide: string]: TwlinchMusicFile[];
  }) {
    const user = await this._authService.currentUser;
    for (const trackSide of keys(files)) {
      // Delete files form folders
      const folderPath = `/orders/${user?.uid}/music/${trackSide}`;
      await this.getFileName(folderPath);
    }
  }

  // Uploading design files - label, sleeve, slipmat..
  public async uploadDesignFile(
    path: string,
    folderPath: string,
    designFile: File,
  ) {
    // Show progress
    this._progressService.show();
    this._progressService.updateDonePercent(0);

    // Delete folder and contents
    await this.deleteFolder(folderPath);

    const totalSize = designFile.size;
    let bytesUploaded = 0;
    const result = await this.uploadFile(path, designFile);
    bytesUploaded += designFile.size;
    this._progressService.updateDonePercent((bytesUploaded * 100) / totalSize);
  }

  // Uploading design files - label, sleeve, slipmat..
  public async uploadDesignAndPreviewsFile(
    pdfPath: string,
    pdfFolderPath: string,
    designFile: File,
    previewFolderPath: string,
    previewFiles: PreviewFile[],
  ) {
    // Show progress
    this._progressService.show();
    this._progressService.updateDonePercent(10);

    // Delete folder and contents
    await this.deleteFolder(pdfFolderPath);

    for (const preview of previewFiles) {
      await this.uploadFile(
        previewFolderPath + "/" + preview.name,
        preview.file,
      );
    }

    const totalSize = designFile.size;
    let bytesUploaded = 0;
    const result = await this.uploadFile(pdfPath, designFile);
    bytesUploaded += designFile.size;
    this._progressService.updateDonePercent((bytesUploaded * 100) / totalSize);
  }

  public async uploadTrackFiles(
    orderNum: string,
    files: {
      [trackSide: string]: TwlinchMusicFile[];
    },
  ) {
    this._progressService.show();
    this._progressService.updateDonePercent(0);

    const user = await this._authService.currentUser;

    const totalSize = this.calculateTotalUploadSize(files);
    let bytesUploaded = 0;

    for (const trackSide of keys(files)) {
      // Delete files form folders
      const folderPath = `/orders/${user?.uid}/music/${trackSide}`;
      await this.deleteFolder(folderPath);
      console.log(`Folder ${folderPath} deleted`);

      const trackFiles = get(files, trackSide);
      console.log(`Starting side ${trackSide}. Items: ${trackFiles.length}`);
      for (let i = 0; i < trackFiles.length; i++) {
        const file = get(trackFiles, i);
        this._progressService.updateBufferPercent(
          ((bytesUploaded + file.file.size) * 100) / totalSize,
        );
        const path = `${folderPath}/${trackSide}_${padStart((i + 1).toFixed(0), 2, "0")} - ${file.file.name}`;
        const result = await this.uploadFile(path, file.file);

        // TODO tale 'result.fullPath' kasneje uporabiš, da dobiš ven stvari z v bazo (pot do dokumenta, itd). Pomoje :)
        console.log(result.metadata.fullPath);

        bytesUploaded += file.file.size;
        this._progressService.updateDonePercent(
          (bytesUploaded * 100) / totalSize,
        );
      }
    }
    this._progressService.hide();
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
