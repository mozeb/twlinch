import {
  Component,
  HostListener,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrderJSON } from "../../interfaces/shopOrder";
import { DatePipe, NgForOf, NgStyle } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
  orderProcessBackgroundColor,
  statusBackgroundColor,
} from "../../services/interfaces";
import { filter, orderBy, sortBy } from "lodash";

@Component({
  selector: "shipped-orders",
  standalone: true,
  imports: [
    RouterOutlet,
    NgForOf,
    MatTableModule,
    NgStyle,
    RouterLink,
    DatePipe,
  ],
  templateUrl: "shipped_orders.html",
  styleUrls: ["./shipped_orders.scss"],
})
export class ShippedOrdersComponent implements OnInit {
  // @ts-ignore
  dataSource: MatTableDataSource<ShopOrderJSON>;
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

  constructor(
    private _firestoreApiService: FirestoreApiService,
    private _router: Router,
  ) {}

  async ngOnInit() {
    this.dataSource = new MatTableDataSource<ShopOrderJSON>([]);
    this.innerHeight = window.innerHeight + "px";
    await this.loadData();
  }

  async loadData() {
    let orders = await this._firestoreApiService.getShippedOrders();
    if (orders) {
      orders = orderBy(orders, "date_created", "desc");
      this.dataSource.data = orders;
      console.log(orders);
    }
  }

  clickRow(id: string): void {
    void this._router.navigate(["/admin-dashboard/admin-orders", id]);
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
