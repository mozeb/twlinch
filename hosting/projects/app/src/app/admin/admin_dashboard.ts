import { Component, HostListener, OnInit } from "@angular/core";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { NgForOf, NgStyle } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatSidenavModule } from "@angular/material/sidenav";

@Component({
  selector: "admin-dashboard",
  standalone: true,
  imports: [
    RouterOutlet,
    NgForOf,
    MatTableModule,
    NgStyle,
    RouterLink,
    MatSidenavModule,
  ],
  templateUrl: "admin_dashboard.html",
  styleUrls: ["./admin_dashboard.scss"],
})
export class Admin_dashboardComponent implements OnInit {
  innerHeight: string | undefined;

  constructor(private _router: Router) {}

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
  }

  navigateTo(path: string) {
    void this._router.navigate([path]);
    // void this._router.navigate([path]).then(() => {
    //   window.location.reload();
    // });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
