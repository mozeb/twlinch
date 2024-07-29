import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../services/auth.service";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { StorageBaseService } from "../../../services/api-base/storage-base.service";
import { Router } from "@angular/router";
import {
  artworkType,
  TransferService,
} from "../../../services/transfer-service";
import { UploadDialogComponent } from "../../../popups/upload-dialog/upload-dialog.component";
import { Observable } from "rxjs";
import { ProgressIndicatorService } from "../../../services/progress-indicator.service";
import { StorageApiService } from "../../../services/storage-api.service";

@Component({
  selector: "upload-template",
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton, MatDialogModule],
  templateUrl: "./upload_template.html",
  styleUrls: ["./upload_template.scss"],
})
export class Upload_templateComponent implements OnInit {
  constructor(
    protected _authService: AuthService,
    protected _baseStorageService: StorageBaseService,
    protected _transferService: TransferService,
    protected _router: Router,
    private dialog: MatDialog,
    private _storageService: StorageApiService,
  ) {}

  user: undefined;
  PSDUrl = "";
  PDFUrl = "";
  AIUrl = "";
  fileName = "";

  fPath = "";

  downloadText = "Download sleeve template";
  uploadText = "Upload sleeve design";

  tempType: artworkType = "undefined";

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.tempType = this._transferService.getType();
    this.getTemplateDownloadLinks();
  }

  async getTemplateDownloadLinks() {
    // Set links for 12 inch regular sleeve
    if (this.tempType == "sleeve12") {
      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/12_inch/sleeve/pdf/Twlinch_12_Inch_Sleeve.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/12_inch/sleeve/ai/Twlinch_12_Inch_Sleeve.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/12_inch/sleeve/psd/Twlinch_12_Inch_Sleeve.psd",
      );
      this.fPath = "sleeve";
    }

    // Set links for 12 inch double sleeve
    if (this.tempType == "sleeveDouble") {
      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/12_inch_double/sleeve/pdf/Twlinch_12_Inch_Double_Sleeve.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/12_inch_double/sleeve/ai/Twlinch_12_Inch_Double_Sleeve.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/12_inch_double/sleeve/psd/Twlinch_12_Inch_Double_Sleeve.psd",
      );
      this.fPath = "sleeve";
    }

    // Set links for 10 inch  sleeve
    if (this.tempType == "sleeve10") {
      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/10_inch/sleeve/pdf/Twlinch_10_Inch_Sleeve.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/10_inch/sleeve/ai/Twlinch_10_Inch_Sleeve.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/10_inch/sleeve/psd/Twlinch_10_Inch_Sleeve.psd",
      );
      this.fPath = "sleeve";
    }

    // Set links for 7 inch  sleeve
    if (this.tempType == "sleeve7") {
      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/7_inch/sleeve/pdf/Twlinch_7_Inch_Sleeve.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/7_inch/sleeve/ai/Twlinch_7_Inch_Sleeve.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/7_inch/sleeve/psd/Twlinch_7_Inch_Sleeve.psd",
      );
      this.fPath = "sleeve";
    }

    // Set links for label AB
    if (this.tempType == "labelAB") {
      this.downloadText = "Download label template";
      this.uploadText = "Upload label design";

      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/LabelAB/pdf/Twlinch_Label_AB.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/LabelAB/ai/Twlinch_Label_AB.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/LabelAB/psd/Twlinch_Label_AB.psd",
      );
      this.fPath = "label";
    }

    // Set links for label
    if (this.tempType == "labelABCD") {
      this.downloadText = "Download label template";
      this.uploadText = "Upload label design";

      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/LabelABCD/pdf/Twlinch_Label_ABCD.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/LabelABCD/ai/Twlinch_Label_ABCD.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/LabelABCD/psd/Twlinch_Label_ABCD.psd",
      );
      this.fPath = "label";
    }

    // Set links for slipmat
    if (this.tempType == "slipmat") {
      this.downloadText = "Download slipmat template";
      this.uploadText = "Upload slipmat design";

      this.PDFUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/slipmat/pdf/Twlinch_Slipmat_Template.pdf",
      );
      this.AIUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/slipmat/ai/Twlinch_Slipmat_Template.ai",
      );
      this.PSDUrl = await this._baseStorageService.getStorageDownloadLink(
        "templates/slipmat/psd/Twlinch_Slipmat_Template.psd",
      );
      this.fPath = "slipmat";
    }

    // Set links for picturedisc
    if (this.tempType == "pictureDisc") {
      this.downloadText = "Download picture disc template";
      this.uploadText = "Upload picture disc design";
      this.fPath = "picture-disc";
    }

    // Return back to upload artwoek if info about element not provided
    if (this.tempType == "undefined") {
      this._router.navigateByUrl("/manage-order/upload-artwork");
    }
  }

  async uploadDesign(input: HTMLInputElement) {
    if (!input.files) return;
    const sleeveFile = input.files[0];
    const user = await this._authService.currentUser;

    const folderPath = `/orders/${user?.uid}/artwork/${this.fPath}/`;
    const path = `/orders/${user?.uid}/artwork/${this.fPath}/${input.files[0].name}`;

    this.dialog.open(UploadDialogComponent, {
      data: { template: this.tempType },
      disableClose: true,
    });

    if (input.files) {
      this._storageService.uploadDesignFile(path, folderPath, sleeveFile);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.fileName = target.files[0].name;
    }
  }

  innerHeight: string | undefined;

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }

  protected readonly event = event;
}
