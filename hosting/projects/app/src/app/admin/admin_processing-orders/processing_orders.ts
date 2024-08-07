import {
  Component,
  HostListener,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { ShopOrderJSON } from "../../interfaces/shopOrder";
import { NgForOf, NgStyle } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
  orderProcessBackgroundColor,
  statusBackgroundColor,
} from "../../services/interfaces";
import { filter, orderBy, sortBy } from "lodash";

@Component({
  selector: "admin-dashboard",
  standalone: true,
  imports: [RouterOutlet, NgForOf, MatTableModule, NgStyle, RouterLink],
  templateUrl: "processiing_orders.html",
  styleUrls: ["./processing_orders.scss"],
})
export class ProcessosingOrdersComponent implements OnInit {
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

  constructor(
    private _firestoreApiService: FirestoreApiService,
    private _router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.innerHeight = window.innerHeight + "px";
    let orders = await this._firestoreApiService.getAllOrders();
    if (orders) {
      orders = orderBy(orders, "date_created", "desc");
      orders = filter(orders, (order) => order.wc_status == "processing");
      this.dataSource = new MatTableDataSource<ShopOrderJSON>(orders);
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
