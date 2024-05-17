import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { environment } from "../../environments/environment";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "admin-home",
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  constructor(protected _authService: AuthService) {}

  protected readonly environment = environment;
}
