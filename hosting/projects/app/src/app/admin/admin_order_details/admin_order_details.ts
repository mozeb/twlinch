import { Component, HostListener, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrderJSON } from "../../interfaces/shopOrder";
import { NgForOf, NgIf, NgStyle } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
  addOnState,
  OrderAddOns,
  OrderProcess,
  orderProcessBackgroundColor,
  statusBackgroundColor,
  twDesignOrderStatusColor,
  twDesignOrderStatusText,
  twDesignStatus,
  twRecordingOrderStatusColor,
  twRecordingOrderStatusText,
  twRecordingStatus,
} from "../../services/interfaces";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { MatIcon } from "@angular/material/icon";
import { AuthService } from "../../services/auth.service";
import { ConfirmActionPopupComponent } from "../../popups/confirm_action_popup/confirm_action_popup.component";
import { MatDialog } from "@angular/material/dialog";
import { TwOrderStatusChangeComponent } from "../../popups/twlinch-order-status-change/tw_order_status_change_popup.component";

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
  twDesignStatusColor = twDesignOrderStatusColor;
  twDesignStatusText = twDesignOrderStatusText;
  twRecordingStatusColor = twRecordingOrderStatusColor;
  twRecordingStatusText = twRecordingOrderStatusText;

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
  designServices: string | undefined;
  onlineDesigner: string | undefined;
  name: string | undefined;
  orderNumber: string | undefined;
  email: string | undefined;

  // Add-ons
  doubleAlbumAdd: string | undefined;
  sleeveAdd: string | undefined;
  labelAdd: string | undefined;
  designServicesAdd: string | undefined;
  onlineDesignerAdd: string | undefined;
  slipmatAdd: string | undefined;

  justVinyl: boolean = false;

  _tw_Design_Order_Status: twDesignStatus = "waitingUploads";
  _tw_Recording_Order_Status: twRecordingStatus = "waitingUploads";

  protected firestore: Firestore = inject(Firestore);

  _orderAddOns: OrderAddOns = {
    doubleAlbumAddOn: "notAdded",
    sleeveAddOn: "notAdded",
    labelAddOn: "notAdded",
    slipmatAddOn: "notAdded",
    designServicesAddOn: "notAdded",
    onlineDesignerAddOn: "notAdded",
  };

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
    private dialog: MatDialog,
    protected _authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.innerHeight = window.innerHeight + "px";
    this.orderId = this._route.snapshot.paramMap.get("id") as string;

    this.getProcessData();

    const order = await this._firestoreApiService.getShopOrderAdmin(
      this.orderId,
    );

    if (order === undefined) {
      return;
    }

    this.artworkLink = order?.artworkZip;
    this.musicLink = order?.musicZip;
    this.name =
      order.address_billing.first_name + " " + order.address_billing.last_name;
    this.orderNumber = order.wc_order_num;
    this.email = order.address_billing.email;
    this._tw_Design_Order_Status = order.tw_design_order_status;
    this._tw_Recording_Order_Status = order.tw_recording_order_status;
    this.getOrderData(order);
  }

  getProcessData() {
    // Watch values
    const unsub = onSnapshot(
      doc(this.firestore, `shopOrders/${this.orderId as string}`),
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

    // Check for add ons
    const unsub1 = onSnapshot(
      doc(this.firestore, `shopOrders/${this.orderId as string}`),
      (doc) => {
        // Get nodes
        this._orderAddOns = doc.get("order_add_ons") as OrderAddOns;

        // Listen to order status changes
        this._tw_Design_Order_Status = doc.get(
          "tw_design_order_status",
        ) as twDesignStatus;

        this._tw_Recording_Order_Status = doc.get(
          "tw_recording_order_status",
        ) as twRecordingStatus;

        // Add ons checker
        if (this._orderAddOns.doubleAlbumAddOn == "added") {
          this.doubleAlbumAdd = "Double Album";
        } else {
          this.doubleAlbumAdd = undefined;
        }

        if (this._orderAddOns.slipmatAddOn == "added") {
          this.slipmatAdd = "Custom Slipmat";
        } else {
          this.slipmatAdd = undefined;
        }

        if (this._orderAddOns.labelAddOn == "added") {
          this.labelAdd = "Custom Label";
        } else {
          this.labelAdd = undefined;
        }

        if (this._orderAddOns.sleeveAddOn == "added") {
          this.sleeveAdd = "Custom Sleeve";
        } else {
          this.sleeveAdd = undefined;
        }

        if (this._orderAddOns.designServicesAddOn == "added") {
          this.designServicesAdd = "Design Services";
        } else {
          this.designServicesAdd = undefined;
        }

        if (this._orderAddOns.onlineDesignerAddOn == "added") {
          this.onlineDesigner = "Online Designer";
        } else {
          this.onlineDesignerAdd = undefined;
        }
      },
    );
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

  openConfirmActionPopup(action: string) {
    const dialogRef = this.dialog.open(ConfirmActionPopupComponent, {
      data: {
        action_name: action,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (action == "music unlock" && result == true) {
        this._orderProcess.musicProcess = "waitingForUpload";
        this.musicLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: { musicProcess: "waitingForUpload" },
            musicZip: "",
          },
        );
      }

      // Unlock sleeve design
      if (action == "sleeve unlock" && result == true) {
        this._orderProcess.sleeveProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: { sleeveProcess: "waitingForUpload" },
            artworkZip: "",
          },
        );
      }

      // Unlock label design
      if (action == "label unlock" && result == true) {
        this._orderProcess.labelProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: { labelProcess: "waitingForUpload" },
            artworkZip: "",
          },
        );
      }

      // Unlock slipmat design
      if (action == "slipmat unlock" && result == true) {
        this._orderProcess.slipmatProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: { slipmatProcess: "waitingForUpload" },
            artworkZip: "",
          },
        );
      }

      // Unlock picture disc design
      if (action == "picture disc unlock" && result == true) {
        this._orderProcess.pictureDiscProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: { pictureDiscProcess: "waitingForUpload" },
            artworkZip: "",
          },
        );
      }

      // Add double album add-on
      if (action == "add double album" && result == true) {
        this._orderProcess.musicProcess = "waitingForUpload";
        this._orderProcess.sleeveProcess = "waitingForUpload";
        this._orderProcess.labelProcess = "waitingForUpload";

        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: {
              musicProcess: "waitingForUpload",
              sleeveProcess: "waitingForUpload",
              labelProcess: "waitingForUpload",
            },
          },
        );
      }

      // Add sleeve
      if (action == "add sleeve" && result == true) {
        this._orderProcess.sleeveProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: {
              sleeveProcess: "waitingForUpload",
              artworkZip: "",
            },
            order_add_ons: { sleeveAddOn: "added" },
          },
        );
      }

      // Add label
      if (action == "add label" && result == true) {
        this._orderProcess.labelProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: {
              labelProcess: "waitingForUpload",
              artworkZip: "",
            },
            order_add_ons: { labelAddOn: "added" },
          },
        );
      }

      // Add slipmat
      if (action == "add slipmat" && result == true) {
        this._orderProcess.slipmatProcess = "waitingForUpload";
        this.artworkLink = undefined;
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_process: {
              slipmatProcess: "waitingForUpload",
              artworkZip: "",
            },
            order_add_ons: { slipmatAddOn: "added" },
          },
        );
      }

      // Add design services
      if (action == "add design services" && result == true) {
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_add_ons: { designServicesAddOn: "added" },
          },
        );
      }

      // Add online designer
      if (action == "add online designer" && result == true) {
        this._firestoreApiService.mergeDoc(
          `shopOrders/${this.orderId as string}`,
          {
            order_add_ons: { onlineDesignerAddOn: "added" },
          },
        );
      }
    });
  }

  openTwStatusChangeDialog(type: string, header: string) {
    const dialogRef = this.dialog.open(TwOrderStatusChangeComponent, {
      data: {
        change_type: type,
        orderId: this.orderId,
        header_text: header,
      },
    });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }

  protected readonly twRecordingOrderStatusColor = twRecordingOrderStatusColor;
  protected readonly twRecordingOrderStatusText = twRecordingOrderStatusText;
}
