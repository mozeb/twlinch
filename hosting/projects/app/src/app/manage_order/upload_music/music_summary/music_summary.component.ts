import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../../../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FirestoreApiService } from "../../../services/firestore-api.service";
import { RouterLink } from "@angular/router";
import { CdkDrag } from "@angular/cdk/drag-drop";
import { MatIcon } from "@angular/material/icon";
import { MatStepperPrevious } from "@angular/material/stepper";
import { StorageBaseService } from "../../../services/api-base/storage-base.service";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { ShopOrderJSON } from "../../../interfaces/shopOrder";

@Component({
  selector: "music-summary",
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatSidenavModule,
    RouterLink,
    CdkDrag,
    MatIcon,
    MatStepperPrevious,
  ],
  templateUrl: "./music_summary.component.html",
  styleUrls: ["./music_summary.component.scss"],
})
export class Music_summaryComponent implements OnInit {
  constructor(
    protected _authService: AuthService,
    private _firestoreService: FirestoreApiService,
    private _storageService: StorageBaseService,
  ) {}

  protected firestore: Firestore = inject(Firestore);

  sideA: Array<string> = [];
  sideB: Array<string> = [];
  sideC: Array<string> = [];
  sideD: Array<string> = [];

  innerHeight: string | undefined;
  doubleAlbum = false;
  order: ShopOrderJSON | undefined;

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getFiles();
  }

  public async getFiles() {
    const user = await this._authService.currentUser;
    this.sideA = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/A`,
    );
    this.sideB = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/B`,
    );
    this.sideC = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/C`,
    );
    this.sideD = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/D`,
    );
  }

  async getOrderData() {
    const user = await this._authService.currentUser;

    this.order = await this._firestoreService.getShopOrder();
    if (this.order === undefined) {
      return;
    }

    // Check the size of vinyl
    this.order.item_lines.forEach((element) => {
      // Double album
      if (element.wc_product_id == 5617) {
        this.doubleAlbum = true;
      }
    });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
