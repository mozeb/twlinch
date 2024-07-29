import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class TransferService {
  constructor(private router: Router) {}

  artworkUploadType: artworkType = "undefined";

  setType(data: artworkType) {
    this.artworkUploadType = data;
  }

  getType() {
    let temp = this.artworkUploadType;
    return temp;
  }
}

export interface sleeveData {
  type: artworkType;
}

export type artworkType =
  | "sleeve12"
  | "sleeveDouble"
  | "sleeve10"
  | "sleeve7"
  | "labelAB"
  | "labelABCD"
  | "slipmat"
  | "music"
  | "undefined"
  | "pictureDisc";
