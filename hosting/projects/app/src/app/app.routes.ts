import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { Manage_orderComponent } from "./manage_order/manage_order.component";
import {
  AuthGuard,
  AuthPipe,
  loggedIn,
  redirectUnauthorizedTo,
} from "@angular/fire/auth-guard";
import { Order_detailsComponent } from "./manage_order/order_details/order_details.component";
import { Upload_musicComponent } from "./manage_order/upload_music/upload_music.component";
import { Upload_artworkComponent } from "./manage_order/upload_artwork/upload_artwork.component";
import { Upload_templateComponent } from "./manage_order/upload_artwork/upload_template/upload_template";
import { Admin_dashboardComponent } from "./admin/admin_dashboard";
import { AdminLoginComponent } from "./admin/admin_login/admin-login.component";
import { Admin_orderDetailsComponent } from "./admin/admin_order_details/admin_order_details";
import { ProcessosingOrdersComponent } from "./admin/admin_processing-orders/processing_orders";
import { pipe, map } from "rxjs";
import { ShippedOrdersComponent } from "./admin/admin_shipped_orders/shipped_orders";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["login"]);
const redirectNotAdminToLogin = () => redirectNotAdminTo(["login"]);
const redirectNotAdminTo: (redirect: string | any[]) => AuthPipe = (redirect) =>
  pipe(
    map((user) => !!user && user.uid === "xfhyHCFuVYOHRsZPmQsD79uc1A52"),
    map((loggedIn) => loggedIn || redirect),
  );

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "admin-login",
    component: AdminLoginComponent,
  },
  {
    path: "admin-dashboard",
    component: Admin_dashboardComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectNotAdminToLogin },
    children: [
      {
        path: "admin-orders/:id",
        component: Admin_orderDetailsComponent,
      },
      {
        path: "processing-orders",
        component: ProcessosingOrdersComponent,
      },
      {
        path: "shipped-orders",
        component: ShippedOrdersComponent,
      },
    ],
  },
  {
    path: "manage-order",
    component: Manage_orderComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [
      {
        path: "order-details",
        component: Order_detailsComponent,
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
      },
      {
        path: "upload-music",
        component: Upload_musicComponent,
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
      },
      {
        path: "upload-artwork",
        component: Upload_artworkComponent,
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
      },
      {
        path: "upload-template",
        component: Upload_templateComponent,
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
      },
    ],
  },
];
