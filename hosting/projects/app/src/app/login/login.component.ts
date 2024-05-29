import { Component, HostListener, Inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { NgIf } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { AuthService } from "../services/auth.service";
import { ProgressIndicatorService } from "../services/progress-indicator.service";
import { NotifyService } from "../services/notify.service";
import * as events from "node:events";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
  ],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  public innerHeight: string | undefined;

  constructor(
    private _authService: AuthService,
    private _fb: FormBuilder,
    private _router: Router,
    private _progress: ProgressIndicatorService,
    private _notify: NotifyService,
  ) {
    this.form = this._fb.group({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }

  ngOnInit() {
    this._authService.user$.subscribe((user) => {
      if (user && user.emailVerified) {
        void this._router.navigate(["/home"]);
      }
    });
    this.innerHeight = window.innerHeight + "px";
    console.log(this.innerHeight);
  }

  async formSubmit() {
    if (this.form.valid) {
      try {
        this._progress.show();
        await this._authService.emailLogin(
          this.form.value.password + "." + this.form.value.email,
          "00" + this.form.value.password,
        );
      } catch (err) {
        console.warn(err);
        return;
      } finally {
        this._progress.hide();
      }
      console.log("Successful login, check if verified.");

      const user = await this._authService.currentUser;
      if (user && user.emailVerified) {
        this._notify.update("Welcome!", "success");

        await this._router.navigate(["/manage-order"]);
        return;
      }
      console.log("Email not verified.");
    }
    return;
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
