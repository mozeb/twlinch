import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrderJSON } from "../../interfaces/shopOrder";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Music_summaryComponent } from "./music_summary/music_summary.component";

import { ReactiveFormsModule } from "@angular/forms";
import {
  STEPPER_GLOBAL_OPTIONS,
  StepperOrientation,
} from "@angular/cdk/stepper";

import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import {
  MatStep,
  MatStepHeader,
  MatStepper,
  MatStepperPrevious,
} from "@angular/material/stepper";
import { MatIcon } from "@angular/material/icon";
import { Storage } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { MatButton } from "@angular/material/button";
import { StorageApiService } from "../../services/storage-api.service";
import { MatProgressBar } from "@angular/material/progress-bar";
import { ProgressIndicatorService } from "../../services/progress-indicator.service";
import { padStart } from "lodash";
import { UploadDialogComponent } from "../../popups/upload-dialog/upload-dialog.component";
import { PlaytimeWarningDialogComponent } from "../../popups/playtime-warning-dialog/playtime-warning-dialog.component";
import { initializeApp } from "@angular/fire/app";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";

export interface TwlinchMusicFile {
  file: File;
  duration: string;
  durationMs: number;
}

@Component({
  selector: "upload-music",
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatSidenavModule,
    CdkDropList,
    CdkDrag,
    MatStepper,
    MatStep,
    MatStepHeader,
    ReactiveFormsModule,
    MatIcon,
    MatButton,
    MatProgressBar,
    MatStepperPrevious,
    MatDialogModule,
    Music_summaryComponent,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  templateUrl: "./upload_music.component.html",
  styleUrls: ["./upload_music.component.scss"],
})
export class Upload_musicComponent implements OnInit {
  protected firestore: Firestore = inject(Firestore);
  musicUploaded = false;

  twlArrayA: Array<TwlinchMusicFile> = [];
  totalPlaytimeA: String = "00:00";
  tptA = 0;

  twlArrayB: Array<TwlinchMusicFile> = [];
  totalPlaytimeB: String = "00:00";
  tptB = 0;

  twlArrayC: Array<TwlinchMusicFile> = [];
  totalPlaytimeC: String = "00:00";
  tptC = 0;

  twlArrayD: Array<TwlinchMusicFile> = [];
  totalPlaytimeD: String = "00:00";
  tptD = 0;

  vinylSize = "Fetching";
  maxDuration = 0;
  doubleAlbum = false;

  fileList: FileList | null = null;

  order: ShopOrderJSON | undefined;

  showProgress$: Observable<boolean>;
  uploadPercentDone$: Observable<number>;
  uploadPercentBuffer$: Observable<number>;

  orientation: StepperOrientation = "horizontal";

  // Storage reference
  protected storage: Storage = inject(Storage);

  constructor(
    protected _authService: AuthService,
    private _firestoreService: FirestoreApiService,
    private _storageService: StorageApiService,
    private dialog: MatDialog,
    private _progress: ProgressIndicatorService,
  ) {
    this.showProgress$ = this._progress.isOn;
    this.uploadPercentDone$ = this._progress.percentDone;
    this.uploadPercentBuffer$ = this._progress.percentBuffer;
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    void this.getOrderData();
    if (window.innerWidth < 768) {
      this.orientation = "vertical";
    } else {
      this.orientation = "horizontal";
    }
  }

  // Get order data
  async getOrderData() {
    const user = await this._authService.currentUser;

    const unsub = onSnapshot(
      doc(this.firestore, `shopOrders/${user?.uid as string}`),
      (doc) => {
        console.log("Music uploaded: ", doc.get("musicUploaded"));
        this.musicUploaded = doc.get("musicUploaded");
      },
    );

    this.order = await this._firestoreService.getShopOrder(user?.uid as string);
    if (this.order === undefined) {
      return;
    }

    // Check the size of vinyl
    this.order.item_lines.forEach((element) => {
      // Check for size of the record
      switch (element.wc_product_id) {
        case 619:
          this.vinylSize = "12' record - max 20 minutes on side A";
          this.maxDuration = 1200;
          break;
        case 620:
          this.vinylSize = "10' record - max 14 minutes on side A";
          this.maxDuration = 840;
          break;
        case 621:
          this.vinylSize = "7' record - max 6 minutes on side A";
          this.maxDuration = 420;
          break;
      }

      // Double album
      if (element.wc_product_id == 5617) {
        this.doubleAlbum = true;
      }
    });
  }

  public innerHeight: string | undefined;

  // resize event listener for window adapting

  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
    if (window.innerWidth < 768) {
      this.orientation = "vertical";
    } else {
      this.orientation = "horizontal";
    }
  }

  public addFiles(event: Event, inputSelector: String): void {
    const element = event.currentTarget as HTMLInputElement;
    this.fileList = element.files;
    // If not empty
    if (this.fileList) {
      const files = Array.from(this.fileList || []);
      files.forEach((element, index) => {
        const obj: TwlinchMusicFile = {
          file: element,
          duration: "00:00",
          durationMs: 0,
        };
        const objectURL = URL.createObjectURL(element);
        const audio = new Audio(objectURL);
        switch (inputSelector) {
          case "a":
            this.twlArrayA.push(obj);
            break;
          case "b":
            this.twlArrayB.push(obj);
            break;
          case "c":
            this.twlArrayC.push(obj);
            break;
          case "d":
            this.twlArrayD.push(obj);
            break;
        }

        audio.onloadedmetadata = (event) => {
          const minutes = Math.floor(audio.duration / 60);
          obj.durationMs = audio.duration;
          obj.duration =
            minutes.toString() +
            ":" +
            (audio.duration % 60).toFixed(0).toString();
          console.log(audio.duration);
          this.recalculateTotalPlaytime(inputSelector);
        };

        audio.addEventListener("loadeddata", function () {});
        audio.addEventListener("loadeddata", () =>
          this.recalculateTotalPlaytime(inputSelector),
        );
      });
    }
  }

  recalculateTotalPlaytime(inputSelector: String) {
    function calculateTotalDuration(files: TwlinchMusicFile[]): number {
      let tmp = 0;
      files.forEach((file) => (tmp += file.durationMs));
      return tmp;
    }

    switch (inputSelector) {
      case "a":
        this.tptA = calculateTotalDuration(this.twlArrayA);
        this.totalPlaytimeA = this.timeString(this.tptA);
        console.log("Side A total: " + this.totalPlaytimeA);
        break;
      case "b":
        this.tptB = calculateTotalDuration(this.twlArrayB);
        this.totalPlaytimeB = this.timeString(this.tptB);
        console.log("Side B total: " + this.totalPlaytimeB);
        break;
      case "c":
        this.tptC = calculateTotalDuration(this.twlArrayC);
        this.totalPlaytimeC = this.timeString(this.tptC);
        console.log("Side C total: " + this.totalPlaytimeC);
        break;
      case "d":
        this.tptD = calculateTotalDuration(this.twlArrayD);
        this.totalPlaytimeD = this.timeString(this.tptD);
        console.log("Side D total: " + this.totalPlaytimeD);
        break;
    }
  }

  drop(event: CdkDragDrop<string[]>, inputSelector: String) {
    switch (inputSelector) {
      case "a":
        moveItemInArray(
          this.twlArrayA,
          event.previousIndex,
          event.currentIndex,
        );
        break;
      case "b":
        moveItemInArray(
          this.twlArrayB,
          event.previousIndex,
          event.currentIndex,
        );
        break;
      case "c":
        moveItemInArray(
          this.twlArrayC,
          event.previousIndex,
          event.currentIndex,
        );
        break;
      case "d":
        moveItemInArray(
          this.twlArrayD,
          event.previousIndex,
          event.currentIndex,
        );
        break;
    }
  }

  removeTrack(i: number, inputselector: String) {
    switch (inputselector) {
      case "a":
        this.twlArrayA.splice(i, 1);
        this.recalculateTotalPlaytime(inputselector);
        break;
      case "b":
        this.twlArrayB.splice(i, 1);
        this.recalculateTotalPlaytime(inputselector);
        break;
      case "c":
        this.twlArrayC.splice(i, 1);
        this.recalculateTotalPlaytime(inputselector);
        break;
      case "d":
        this.twlArrayD.splice(i, 1);
        this.recalculateTotalPlaytime(inputselector);
        break;
    }
  }

  async uploadTracks(input: HTMLInputElement) {
    if (!input.files || !this.order) return;
    this.dialog.open(UploadDialogComponent, { disableClose: true });

    await this._storageService.uploadTrackFiles(this.order.wc_order_num, {
      A: this.twlArrayA,
      B: this.twlArrayB,
      C: this.twlArrayC,
      D: this.twlArrayD,
    });
  }

  timeString(milliseconds: number): string {
    return (
      padStart(Math.floor(milliseconds / 60).toString(), 2, " ") +
      ":" +
      padStart(Math.ceil(milliseconds % 60).toString(), 2, "0")
    );
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
  }

  goForward(stepper: MatStepper, playtime: number) {
    if (playtime <= this.maxDuration) {
      stepper.next();
    } else {
      this.openPlaytimeWarningDialog(playtime);
    }
  }

  openPlaytimeWarningDialog(platime: number) {
    this.dialog.open(PlaytimeWarningDialogComponent, {
      data: {
        maxTime: this.timeString(this.maxDuration),
        yourTime: this.timeString(platime),
      },
    });
  }
}
