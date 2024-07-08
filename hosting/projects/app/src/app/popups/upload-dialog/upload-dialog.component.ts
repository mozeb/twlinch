import { Component, OnInit, ViewEncapsulation } from "@angular/core";
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

  constructor(
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    private _progress: ProgressIndicatorService,
    private _firestoreService: FirestoreBaseService,
    private _authService: AuthService,
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
  }

  // Update user when upload complete
  async updateUser() {
    const user = await this._authService.currentUser;
    this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
      musicUploaded: true,
    });
  }

  showProgress$: Observable<boolean>;
  uploadPercentDone$: Observable<number>;
  uploadPercentBuffer$: Observable<number>;
}

export interface OrderProcess {
  musicUplaoded: boolean;
}
