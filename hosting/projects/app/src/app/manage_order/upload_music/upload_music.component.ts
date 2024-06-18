import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrderJSON } from "../../interfaces/shopOrder";

import { ReactiveFormsModule } from "@angular/forms";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";

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

  // Storage reference
  protected storage: Storage = inject(Storage);

  constructor(
    protected _authService: AuthService,
    private _firestoreService: FirestoreApiService,
    private _storageService: StorageApiService,
    private _progress: ProgressIndicatorService,
  ) {
    this.showProgress$ = this._progress.isOn;
    this.uploadPercentDone$ = this._progress.percentDone;
    this.uploadPercentBuffer$ = this._progress.percentBuffer;
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    void this.getOrderData();
  }

  // Get order data
  async getOrderData() {
    const user = await this._authService.currentUser;
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

        audio.addEventListener("loadeddata", function () {
          const minutes = Math.floor(this.duration / 60);
          obj.durationMs = this.duration;
          obj.duration =
            minutes.toString() +
            ":" +
            (this.duration % 60).toFixed(0).toString();
          console.log(this.duration);
        });
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
}
