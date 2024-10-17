import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { RouterLink } from "@angular/router";
import { orderState, OrderProcess } from "../../services/interfaces";
import { AddShippingDetailsPopupComponent } from "../../popups/add-shipping-popup/add_shipping_popup.component";
import { MatDialog } from "@angular/material/dialog";
import { MessagePopupComponent } from "../../popups/message_dialog/message_popup.component";
import { User } from "@angular/fire/auth";
import { ShopOrderJSON, WCOrderBilling } from "../../interfaces/shopOrder";

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
    private dialog: MatDialog,
  ) {}

  protected firestore: Firestore = inject(Firestore);

  _billingDetails: WCOrderBilling = {
    address_1: "",
    address_2: "",
    city: "",
    company: "",
    country: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    postcode: "",
    state: "",
  };

  _orderProcess: OrderProcess = {
    musicProcess: "notOrdered",
    labelProcess: "notOrdered",
    sleeveProcess: "notOrdered",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "notOrdered",
  };

  justVinyl = false;
  isGift = false;

  public innerHeight: string | undefined;
  public vinylSize: string | undefined;
  public vinylColor: string | undefined;
  public sleeve: string | undefined;
  public label: string | undefined;
  public doubleAlbum: string | undefined;
  public slipmat: string | undefined;
  public designServices: string | undefined;
  public onlineDesigner: string | undefined;
  uid: string | undefined = "";

  order: ShopOrderJSON | undefined;

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getOrderData();
  }

  async getOrderData() {
    const user = await this._authService.currentUser;
    this.uid = user?.uid;
    this.order = await this._firestoreService.getShopOrder();
    if (this.order === undefined) {
      return;
    }

    // Check if it is gift order
    if (this.order.isGift && this.order.isGift == true) {
      this.isGift = true;
      console.log("Gift Order");
    }

    // Watch values
    const unsub = onSnapshot(
      doc(this.firestore, `shopOrders/${user?.uid as string}`),
      (doc) => {
        this._orderProcess = doc.get("order_process") as OrderProcess;
        this._billingDetails = doc.get("address_billing") as WCOrderBilling;
        console.log(this._billingDetails);
        // Check if there is nothing for design
        if (
          this._orderProcess.sleeveProcess === "notOrdered" &&
          this._orderProcess.labelProcess === "notOrdered" &&
          this._orderProcess.slipmatProcess === "notOrdered" &&
          this._orderProcess.pictureDiscProcess === "notOrdered"
        ) {
          this.justVinyl = true;
        }
      },
    );

    this.order.item_lines.forEach((element) => {
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

      // Picture disc size
      switch (element.wc_product_id) {
        case 5049:
          this.vinylSize = "7 Inch Picture Disc";
          break;
        case 5052:
          this.vinylSize = "12 Inch Picture Disc";
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

      // Design Services
      if (element.wc_product_id == 686) {
        this.designServices = "Design Services";
      }

      // Online Designer
      /*if (element.wc_product_id == ??) {
        this.onlineDesigner = "Online Designer";
      }*/
    });
  }

  addShippingDetailsDialog() {
    const dialogRef = this.dialog.open(AddShippingDetailsPopupComponent, {
      data: this._billingDetails,
    });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
