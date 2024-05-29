import { Component, HostListener, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { environment } from "../../environments/environment";
import { AuthService } from "../services/auth.service";
import { MatSidenavModule } from "@angular/material/sidenav";

@Component({
  selector: "manage-order",
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatSidenavModule],
  templateUrl: "./manage_order.component.html",
  styleUrls: ["./manage_order.component.scss"],
})
export class Manage_orderComponent implements OnInit {
  constructor(protected _authService: AuthService) {}
  public innerHeight: string | undefined;

  protected readonly environment = environment;

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
