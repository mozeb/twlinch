import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";
import { artworkType } from "../../services/transfer-service";
import { UploadDialogComponent } from "../upload-dialog/upload-dialog.component";
import { StorageApiService } from "../../services/storage-api.service";
import { AuthService } from "../../services/auth.service";
import { StorageBaseService } from "../../services/api-base/storage-base.service";

@Component({
  selector: "design-preview-popup",
  standalone: true,
  imports: [AsyncPipe, NgIf, MatDialogContent, MatDialogClose],
  templateUrl: "./design-preview-popup.html",
  styleUrl: "./design-preview-popup.scss",
  encapsulation: ViewEncapsulation.None,
})
export class DesignPreviewPopupComponent implements OnInit {
  fPath = "";
  tempType: artworkType = "undefined";

  constructor(
    public dialogRef: MatDialogRef<DesignPreviewPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DesignerPreviewData,
    private dialog: MatDialog,
    private _storageService: StorageApiService,
    protected _authService: AuthService,
    protected _baseStorageService: StorageBaseService,
  ) {}

  ngOnInit() {
    this.showPreviews();
    this.tempType = this.data.type;
    /// Determine where to upload based on file that is in design.
    if (
      this.data.type == "sleeve7" ||
      this.data.type == "sleeve12" ||
      this.data.type == "sleeve10" ||
      this.data.type == "sleeveDouble"
    ) {
      this.fPath = "sleeve";
    } else if (this.data.type == "labelAB" || this.data.type == "labelABCD") {
      this.fPath = "label";
    } else if (this.data.type == "slipmat") {
      this.fPath = "slipmat";
    } else if (
      this.data.type == "pictureDisc12" ||
      this.data.type == "pictureDisc7" ||
      this.data.type == "pictureDisc"
    ) {
      this.fPath = "picture-disc";
    }
  }

  showPreviews() {
    const lblA = document.getElementById("preview-label-a") as HTMLImageElement;
    if (lblA) {
      if (this.data.labelAPreview != "") {
        lblA.src = this.data.labelAPreview;
      }
    }

    const lblB = document.getElementById("preview-label-b") as HTMLImageElement;
    if (lblB) {
      if (this.data.labelBPreview != "") {
        lblB.src = this.data.labelBPreview;
      }
    }

    const lblC = document.getElementById("preview-label-c") as HTMLImageElement;
    if (lblC) {
      if (this.data.labelCPreview != "") {
        lblC.src = this.data.labelCPreview;
      }
    }

    const lblD = document.getElementById("preview-label-d") as HTMLImageElement;
    if (lblD) {
      if (this.data.labelDPreview != "") {
        lblD.src = this.data.labelDPreview;
      }
    }

    const sleeve = document.getElementById(
      "preview-sleeve",
    ) as HTMLImageElement;
    if (sleeve) {
      if (this.data.sleevePreview != "") {
        sleeve.src = this.data.sleevePreview;
      }
    }
  }

  async uploadDesign() {
    // Wait for the result of createFileFromURL
    if (!this.data.pdfFile) {
      console.error("Failed to create the file from URL");
      return; // Exit early if the file creation fails
    }

    const user = await this._authService.currentUser;
    const folderPath = `/orders/${user?.uid}/artwork/${this.fPath}`;
    const path = `/orders/${user?.uid}/artwork/${this.fPath}/${this.data.pdfFile.name}`;
    const previewFolderPath = `/orders/${user?.uid}/previews/${this.fPath}`;
    let previewFiles: PreviewFile[] = [];

    if (this.data.type == "labelABCD" || this.data.type == "labelAB") {
      if (this.data.type == "labelAB") {
        const fileNameA = "preview-label-a.png";
        const fileA = this.dataURLToFile(this.data.labelAPreview, fileNameA);
        const fileNameB = "preview-label-b.png";
        const fileB = this.dataURLToFile(this.data.labelBPreview, fileNameB);
        previewFiles.push({ file: fileA, name: "Preview_A" });
        previewFiles.push({ file: fileB, name: "Preview_B" });
      } else if (this.data.type == "labelABCD") {
        const fileNameA = "preview-label-a.png";
        const fileA = this.dataURLToFile(this.data.labelAPreview, fileNameA);
        const fileNameB = "preview-label-b.png";
        const fileB = this.dataURLToFile(this.data.labelBPreview, fileNameB);
        const fileNameC = "preview-label-c.png";
        const fileC = this.dataURLToFile(this.data.labelCPreview, fileNameC);
        const fileNameD = "preview-label-d.png";
        const fileD = this.dataURLToFile(this.data.labelDPreview, fileNameD);
        previewFiles.push({ file: fileA, name: "Preview_A" });
        previewFiles.push({ file: fileB, name: "Preview_B" });
        previewFiles.push({ file: fileC, name: "Preview_C" });
        previewFiles.push({ file: fileD, name: "Preview_D" });
      }
    } else if (
      this.data.type == "sleeve12" ||
      this.data.type == "sleeve7" ||
      this.data.type == "sleeve10" ||
      this.data.type == "sleeveDouble"
    ) {
      const file = this.dataURLToFile(this.data.sleevePreview, "");
      previewFiles.push({ file: file, name: "Preview_Sleeve" });
    } else if (this.data.type == "pictureDisc") {
      const file = this.dataURLToFile(this.data.pictureDiscPreview, "");
      previewFiles.push({ file: file, name: "Preview_Picture_Disc" });
    } else if (this.data.type == "slipmat") {
      const file = this.dataURLToFile(this.data.pictureDiscPreview, "");
      previewFiles.push({ file: file, name: "Preview_Slipmat" });
    }

    this.dialog.open(UploadDialogComponent, {
      data: { template: this.tempType },
      disableClose: true,
    });

    // Do the upload
    if (this.data.pdfFile) {
      this._storageService.uploadDesignAndPreviewsFile(
        path,
        folderPath,
        this.data.pdfFile,
        previewFolderPath,
        previewFiles,
      );
    }
  }

  dataURLToFile(dataURL: string, fileName: string): File {
    // Split the data URL to get the base64-encoded string
    const [header, base64String] = dataURL.split(",");

    // Decode the base64 string to binary data
    const byteString = atob(base64String);

    // Create a Uint8Array to hold the binary data
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    // Extract MIME type from the header
    const mimeType = header.match(/:(.*?);/)?.[1] || "application/octet-stream";

    // Create a Blob from the binary data and MIME type
    const blob = new Blob([byteArray], { type: mimeType });

    // Create a File from the Blob
    return new File([blob], fileName, { type: mimeType });
  }

  closeDialog(selection: boolean) {
    this.dialogRef.close(selection);
  }
}

export interface DesignerPreviewData {
  type: artworkType;
  labelAPreview: string;
  labelBPreview: string;
  labelCPreview: string;
  labelDPreview: string;
  sleevePreview: string;
  pictureDiscPreview: string;
  slipmatPreview: string;
  pdfFile: File;
}

export interface PreviewFile {
  file: File;
  name: string;
}
