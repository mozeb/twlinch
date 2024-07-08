import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrder } from "../../interfaces/shopOrder";
import { doc, Firestore, onSnapshot, or } from "@angular/fire/firestore";
import { RouterLink } from "@angular/router";

@Component({
  selector: "order-details",
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatSidenavModule, RouterLink],
  templateUrl: "./order_details.component.html",
  styleUrls: ["./order_details.component.scss"],
})
export class Order_detailsComponent implements OnInit {
  constructor(
    protected _authService: AuthService,
    private _firestoreService: FirestoreApiService,
  ) {}

  protected firestore: Firestore = inject(Firestore);
  musicUploaded = false;
  labelUploaded = false;
  sleeveUploaded = false;
  slipmatUploaded = false;
  pictureDiscUploaded = false;

  public innerHeight: string | undefined;
  public vinylSize: string | undefined;
  public vinylColor: string | undefined;
  public sleeve: string | undefined;
  public label: string | undefined;
  public doubleAlbum: string | undefined;
  public slipmat: string | undefined;

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getOrderData();
  }

  async getOrderData() {
    const user = await this._authService.currentUser;
    const order = await this._firestoreService.getShopOrder(
      user?.uid as string,
    );
    if (order === undefined) {
      return;
    }

    // Watch values
    const unsub = onSnapshot(
      doc(this.firestore, `shopOrders/${user?.uid as string}`),
      (doc) => {
        this.musicUploaded = doc.get("musicUploaded") ?? false;
        this.sleeveUploaded = doc.get("sleeveUploaded") ?? false;
        this.labelUploaded = doc.get("labelUploaded") ?? false;
        this.slipmatUploaded = doc.get("slipmatUploaded") ?? false;
        this.pictureDiscUploaded = doc.get("pictureDiscUploaded") ?? false;
      },
    );

    order.item_lines.forEach((element) => {
      // Check for size of the record
      switch (element.wc_product_id) {
        case 619:
          this.vinylSize = "12 Inch Record";
          break;
        case 620:
          this.vinylSize = "10 Inch Record";
          break;
        case 621:
          this.vinylSize = "7 Inch Record";
          break;
      }

      // Vinyl Color
      switch (element.wc_product_id) {
        case 656:
          this.vinylColor = "Black Vinyl";
          break;
        case 657:
          this.vinylColor = "Transparent Vinyl";
          break;
      }

      // Type of label
      switch (element.wc_product_id) {
        case 626:
          this.label = "White Label";
          break;
        case 3972:
          this.label = "Custom Printed Label";
          break;
        case 3973:
          this.label = "Custom Printed Label";
          break;
        case 627:
          this.label = "Custom Printed Label";
          break;
        case 5038:
          this.label = "No Label";
          break;
      }

      // Type of sleeve
      switch (element.wc_product_id) {
        case 659:
          this.sleeve = "Custom Printed Sleeve";
          break;
        case 3974:
          this.sleeve = "Custom Printed Sleeve";
          break;
        case 3975:
          this.sleeve = "Custom Printed Sleeve";
          break;
        case 658:
          this.sleeve = "Black Discobag";
          break;
      }

      // Double album
      if (element.wc_product_id == 5617) {
        this.doubleAlbum = "Double Album";
      }

      // Custom slipmat
      if (element.wc_product_id == 691) {
        this.slipmat = "Custom Slipmat";
      }
    });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
