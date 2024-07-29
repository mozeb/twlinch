import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { Order_detailsComponent } from "./order_details/order_details.component";
import { FirestoreApiService } from "../services/firestore-api.service";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { OrderProcess } from "../services/interfaces";

@Component({
  selector: "manage-order",
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatSidenavModule,
    Order_detailsComponent,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: "./manage_order.component.html",
  styleUrls: ["./manage_order.component.scss"],
})
export class Manage_orderComponent implements OnInit {
  constructor(
    protected _authService: AuthService,
    private _firestoreService: FirestoreApiService,
    private _router: Router,
  ) {}

  justVinyl = false;
  _orderProcess: OrderProcess = {
    musicProcess: "notOrdered",
    labelProcess: "notOrdered",
    sleeveProcess: "notOrdered",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "notOrdered",
  };

  public innerHeight: string | undefined;
  public orderNumber: string | undefined;

  protected firestore: Firestore = inject(Firestore);

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getOrderData();
  }

  async getOrderData() {
    const user = await this._authService.currentUser;

    // Watch values
    const unsub = onSnapshot(
      doc(this.firestore, `shopOrders/${user?.uid as string}`),
      (doc) => {
        this._orderProcess = doc.get("order_process") as OrderProcess;
        // Check if there is nothing for design
        if (
          this._orderProcess.sleeveProcess === "notOrdered" &&
          this._orderProcess.labelProcess === "notOrdered" &&
          this._orderProcess.slipmatProcess == "notOrdered"
        ) {
          this.justVinyl = true;
        }
      },
    );

    const order = await this._firestoreService.getShopOrder();
    if (order === undefined) {
      return;
    }
    this.orderNumber = order.wc_order_num;
    console.log(order.item_lines[0].name);
  }

  logOut() {
    this._authService.signOut();
    this._router.navigate(["/login"]);
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
export interface OrderDetails {
  auth_uid: string;
}
