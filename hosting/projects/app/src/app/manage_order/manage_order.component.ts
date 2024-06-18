import { Component, HostListener, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";
import { Order_detailsComponent } from "./order_details/order_details.component";
import { FirestoreApiService } from "../services/firestore-api.service";
import { ShopOrder } from "../interfaces/shopOrder";
import { RouterLink, RouterOutlet } from "@angular/router";

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
  ) {}

  public innerHeight: string | undefined;
  public orderNumber: string | undefined;

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
    this.getOrderData();
  }

  async getOrderData() {
    const user = await this._authService.currentUser;
    const order = (await this._firestoreService.getShopOrder(
      user?.uid as string,
    )) as ShopOrder;
    this.orderNumber = order.wc_order_num;
    console.log(order.item_lines[0].name);
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
