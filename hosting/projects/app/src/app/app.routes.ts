import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { Manage_orderComponent } from "./manage_order/manage_order.component";
import { AuthGuard, redirectUnauthorizedTo } from "@angular/fire/auth-guard";
import { Order_detailsComponent } from "./manage_order/order_details/order_details.component";
import { Upload_musicComponent } from "./manage_order/upload_music/upload_music.component";
import { Upload_artworkComponent } from "./manage_order/upload_artwork/upload_artwork.component";
import { Upload_templateComponent } from "./manage_order/upload_artwork/upload_template/upload_template";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["login"]);

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
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
