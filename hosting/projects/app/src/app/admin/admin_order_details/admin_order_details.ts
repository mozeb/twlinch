import { Component, HostListener, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrderJSON } from "../../interfaces/shopOrder";
import { NgForOf, NgIf, NgStyle } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
  OrderProcess,
  orderProcessBackgroundColor,
  statusBackgroundColor,
} from "../../services/interfaces";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { MatIcon } from "@angular/material/icon";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "admin-orders",
  standalone: true,
  imports: [RouterOutlet, NgForOf, MatTableModule, NgStyle, NgIf, MatIcon],
  templateUrl: "admin_order_details.html",
  styleUrls: ["./admin_order_details.scss"],
})
export class Admin_orderDetailsComponent implements OnInit {
  dataSource: MatTableDataSource<ShopOrderJSON> | undefined;
  displayedColumns = [
    "wc_order_num",
    "address_billing",
    "order_process",
    "date_created",
    "wc_status",
  ];
  statusColor = statusBackgroundColor;
  orderProcessColor = orderProcessBackgroundColor;
  innerHeight: string | undefined;
  orderId: string | undefined;

  artworkLink: string | undefined = "";
  musicLink: string | undefined = "";

  vinylSize: string | undefined;
  vinylColor: string | undefined;
  sleeve: string | undefined;
  label: string | undefined;
  doubleAlbum: string | undefined;
  slipmat: string | undefined;
  name: string | undefined;
  orderNumber: string | undefined;

  justVinyl: boolean = false;

  protected firestore: Firestore = inject(Firestore);

  _orderProcess: OrderProcess = {
    musicProcess: "notOrdered",
    labelProcess: "notOrdered",
    sleeveProcess: "notOrdered",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "notOrdered",
  };

  constructor(
    private _firestoreApiService: FirestoreApiService,
    private _route: ActivatedRoute,
    protected _authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.innerHeight = window.innerHeight + "px";
    this.orderId = this._route.snapshot.paramMap.get("id") as string;

    const order = await this._firestoreApiService.getShopOrderAdmin(
      this.orderId,
    );

    if (order === undefined) {
      return;
    }

    // Watch values
    const user = await this._authService.currentUser;
    const unsub = onSnapshot(
      doc(this.firestore, `shopOrders/${user?.uid as string}`),
      (doc) => {
        this._orderProcess = doc.get("order_process") as OrderProcess;
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
    console.log(this._orderProcess);

    this.artworkLink = order?.artworkZip;
    this.musicLink = order?.musicZip;
    this.name =
      order.address_billing.first_name + " " + order.address_billing.last_name;
    this.orderNumber = order.wc_order_num;
    this.getOrderData(order);
  }

  async getOrderData(order: ShopOrderJSON) {
    this._orderProcess = order.order_process;
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
    });
  }

  downloadFiles(type: string) {
    if (type == "music") {
      window.open(this.musicLink, "_blank");
    } else if (type == "artwork") {
      window.open(this.artworkLink, "_blank");
    }
  }

  copyToClipboard(type: string) {
    if (type == "music") {
      navigator.clipboard.writeText(this.musicLink!);
    } else if (type == "artwork") {
      navigator.clipboard.writeText(this.artworkLink!);
    }
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
