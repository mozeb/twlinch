import {
  Component,
  HostListener,
  inject,
  Input,
  input,
  NgModule,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { DatastoreApiService } from "../../services/datastore-api.service";
import { ShopOrder } from "../../interfaces/shopOrder";

import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";

import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatStep, MatStepHeader, MatStepper } from "@angular/material/stepper";
import { MatIcon } from "@angular/material/icon";
import { ref } from "@angular/fire/database";
import {
  Storage,
  ref as refStorage,
  uploadBytesResumable,
} from "@angular/fire/storage";
import { finalize } from "rxjs";
import { createUploadTask } from "@angular/fire/compat/storage";
import { MatButton } from "@angular/material/button";

const URL2 = "https://evening-anchorage-3159.herokuapp.com/api/";
var mySound = new Audio();
var songDuraton = "00:00";
var fullDuration = 0;

var fileList: FileList | null;

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

  musicInput = document.getElementById("music-a-input") as HTMLInputElement;

  // Storage reference
  protected storage: Storage = inject(Storage);

  constructor(
    protected _authService: AuthService,
    private _firestoreService: DatastoreApiService,
    private _formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getOrderData();
  }

  // Get order data
  async getOrderData() {
    const user = await this._authService.currentUser;
    const order = (await this._firestoreService.getShopOrder(
      user?.uid as string,
    )) as ShopOrder;

    // Check the size of vinyl
    order.item_lines.forEach((element) => {
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
    fileList = element.files;
    // If not empty
    if (fileList) {
      var files = Array.from(fileList || []);
      files.forEach((element, index) => {
        var obj = {} as TwlinchMusicFile;
        obj.file = element;
        obj.duration = "00:00";
        var objectURL = URL.createObjectURL(element);
        var audio = new Audio();
        audio.src = objectURL;
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
          var minutes = Math.floor(this.duration / 60);
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
    switch (inputSelector) {
      case "a":
        this.tptA = 0;
        this.twlArrayA.forEach((element, index) => {
          this.tptA = this.tptA + element.durationMs;
        });
        var minutes = Math.floor(this.tptA / 60);
        var seconds = Math.floor(this.tptA % 60);
        this.totalPlaytimeA = minutes.toString() + ":" + seconds.toString();
        console.log("Side A total: " + this.totalPlaytimeA);
        break;
      case "b":
        this.tptB = 0;
        this.twlArrayB.forEach((element, index) => {
          this.tptB = this.tptB + element.durationMs;
        });
        var minutes = Math.floor(this.tptB / 60);
        var seconds = Math.floor(this.tptB % 60);
        this.totalPlaytimeB = minutes.toString() + ":" + seconds.toString();
        console.log("Side B total: " + this.totalPlaytimeB);
        break;
      case "c":
        this.tptC = 0;
        this.twlArrayC.forEach((element, index) => {
          this.tptC = this.tptC + element.durationMs;
        });
        var minutes = Math.floor(this.tptC / 60);
        var seconds = Math.floor(this.tptC % 60);
        this.totalPlaytimeC = minutes.toString() + ":" + seconds.toString();
        console.log("Side C total: " + this.totalPlaytimeC);
        break;
      case "d":
        this.tptD = 0;
        this.twlArrayD.forEach((element, index) => {
          this.tptD = this.tptD + element.durationMs;
        });
        var minutes = Math.floor(this.tptD / 60);
        var seconds = Math.floor(this.tptD % 60);
        this.totalPlaytimeD = minutes.toString() + ":" + seconds.toString();
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

  uploadFile(input: HTMLInputElement) {
    if (!input.files) return;
    const files: FileList = input.files;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        const storageRef = refStorage(
          this.storage,
          "/" + "testupload/" + "track_0" + (i + 1) + " - " + file.name,
        );
        uploadBytesResumable(storageRef, file);
      }
    }
  }

  protected readonly fileList = fileList;
}

export interface TwlinchMusicFile {
  file: File;
  duration: string;
  durationMs: number;
}

export interface TwlinchMusicFiles extends Array<TwlinchMusicFile> {}
