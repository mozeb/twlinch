import { Component, inject, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ProgressIndicatorService } from "../../services/progress-indicator.service";
import { MatProgressBar } from "@angular/material/progress-bar";
import { AsyncPipe, NgIf } from "@angular/common";
import { FirestoreBaseService } from "../../services/api-base/firestore-base.service";
import { AuthService } from "../../services/auth.service";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";
import { artworkType } from "../../services/transfer-service";
import { Router } from "@angular/router";

@Component({
  selector: "app-upload-dialog",
  standalone: true,
  imports: [MatProgressBar, AsyncPipe, NgIf, MatDialogContent, MatDialogClose],
  templateUrl: "./upload-dialog.component.html",
  styleUrl: "./upload-dialog.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class UploadDialogComponent implements OnInit {
  uploadBuffer = 0;
  uploadComplete: boolean = false;
  uploadingText = "Uploading...";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { template: artworkType },
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    private _progress: ProgressIndicatorService,
    private _firestoreService: FirestoreBaseService,
    private _authService: AuthService,
    private _router: Router,
  ) {
    this.showProgress$ = this._progress.isOn;
    this.uploadPercentDone$ = this._progress.percentDone;
    this.uploadPercentBuffer$ = this._progress.percentBuffer;
  }

  ngOnInit(): void {
    this.uploadPercentDone$.subscribe((value: number) => {
      console.log(value);
      if (value >= 100) {
        this.uploadComplete = true;
        this.updateUser();
      }
      this.uploadBuffer = value;
    });

    if (this.data.template == "music") {
      this.uploadingText = "Your music is uploading!";
    } else {
      this.uploadingText = "Your design is uploading!";
    }
  }

  // Update user when upload complete
  async updateUser() {
    const user = await this._authService.currentUser;

    // Set proces state to database when finished with uplaoding
    if (this.data.template == "music") {
      this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
        order_process: { musicProcess: "uploadFinished" },
      });
    } else if (
      this.data.template == "labelAB" ||
      this.data.template == "labelABCD"
    ) {
      this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
        order_process: { labelProcess: "uploadFinished" },
      });
    } else if (
      this.data.template == "sleeve7" ||
      this.data.template == "sleeve12" ||
      this.data.template == "sleeve10" ||
      this.data.template == "sleeveDouble"
    ) {
      this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
        order_process: { sleeveProcess: "uploadFinished" },
      });
    } else if (this.data.template == "slipmat") {
      this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
        order_process: { slipmatProcess: "uploadFinished" },
      });
    } else if (this.data.template == "pictureDisc") {
      this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
        order_process: { pictureDiscProcess: "uploadFinished" },
      });
    }
  }

  closeDialog() {
    this.dialogRef.close(true);
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this._router.navigateByUrl("/manage-order/upload-artwork");
    });
  }

  showProgress$: Observable<boolean>;
  uploadPercentDone$: Observable<number>;
  uploadPercentBuffer$: Observable<number>;
}
