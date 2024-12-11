import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { artworkType, TransferService } from "../../services/transfer-service";
import { Route, Router } from "@angular/router";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { OrderProcess } from "../../services/interfaces";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { DesignerPopupComponent } from "../../popups/designer-popup/designer-popup.component";

@Component({
  selector: "upload-artwork",
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton, MatDialogModule],
  templateUrl: "./upload_artwork.component.html",
  styleUrls: ["./upload_artwork.component.scss"],
})
export class Upload_artworkComponent implements OnInit {
  constructor(
    protected _authService: AuthService,
    protected _transferService: TransferService,
    protected _router: Router,
    protected _firestoreService: FirestoreApiService,
    protected dialog: MatDialog,
  ) {}

  innerHeight: string | undefined;
  vinylSize: artworkType = "sleeve12";
  pictureDiscSize: artworkType = "pictureDisc12";
  doubleAlbum: boolean = false;

  _orderProcess: OrderProcess = {
    musicProcess: "notOrdered",
    labelProcess: "notOrdered",
    sleeveProcess: "notOrdered",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "notOrdered",
  };

  protected firestore: Firestore = inject(Firestore);

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getOrderData();
    this.openDesigner();
  }

  async getOrderData() {
    // Watch order process value to update UI
    const user = await this._authService.currentUser;
    const op = onSnapshot(
      doc(this.firestore, `shopOrders/${user?.uid as string}`),
      (doc) => {
        this._orderProcess = doc.get("order_process") as OrderProcess;
      },
    );

    const order = await this._firestoreService.getShopOrder();
    if (order === undefined) {
      return;
    }

    order.item_lines.forEach((element) => {
      // Check for size of the record
      switch (element.wc_product_id) {
        case 619:
          this.vinylSize = "sleeve12";
          break;
        case 620:
          this.vinylSize = "sleeve10";
          break;
        case 621:
          this.vinylSize = "sleeve7";
          break;
        case 5617:
          this.vinylSize = "sleeveDouble";
          this.doubleAlbum = true;
      }
    });

    order.item_lines.forEach((element) => {
      // Check for size of the record
      switch (element.wc_product_id) {
        case 5052:
          this.pictureDiscSize = "pictureDisc12";
          break;
        case 5049:
          this.pictureDiscSize = "pictureDisc7";
          break;
      }
    });
  }

  goToUploader(goTo: string) {
    if (goTo == "sleeve") {
      this._transferService.setType(this.vinylSize);
    } else if (goTo == "label") {
      this._transferService.setType("labelAB");
      if (this.vinylSize == "sleeveDouble") {
        this._transferService.setType("labelABCD");
      }
    } else if (goTo == "slipmat") {
      this._transferService.setType("slipmat");
    } else if (goTo == "pictureDisc") {
      this._transferService.setType(this.pictureDiscSize);
    }

    this._router.navigateByUrl("/manage-order/upload-template");
  }

  openDesigner() {
    this.dialog.open(DesignerPopupComponent, {
      disableClose: true,
      width: "100vw",
      height: "100vh",
      data: {
        type: "label",
        vinylSize: this.vinylSize,
        doubleAlbum: this.doubleAlbum,
      },
    });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
