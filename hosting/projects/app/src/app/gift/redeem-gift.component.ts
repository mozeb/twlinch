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
import { FunctionsApiService } from "../services/functions-api.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmActionPopupComponent } from "../popups/confirm_action_popup/confirm_action_popup.component";
import {
  Message,
  MessagePopupComponent,
} from "../popups/message_dialog/message_popup.component";

@Component({
  selector: "redeem-gift-card",
  templateUrl: "./redeem-gift.component.html",
  styleUrls: ["./redeem-gift.component.scss"],
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
export class RedeemGiftComponent implements OnInit {
  form: FormGroup;
  public innerHeight: string | undefined;

  constructor(
    private _authService: AuthService,
    private _fb: FormBuilder,
    private _router: Router,
    private _progress: ProgressIndicatorService,
    private _notify: NotifyService,
    private _functionsApi: FunctionsApiService,
    private dialog: MatDialog,
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
        void this._router.navigate(["/manage-order/order-details"]);
      }
    });
    this.innerHeight = window.innerHeight + "px";
  }

  async formSubmit() {
    if (this.form.valid) {
      try {
        this._progress.show();
        const res = await this._functionsApi.registerDoctor({
          email: this.form.value.password + "." + this.form.value.email,
          pass: this.form.value.password,
        });
        if (res.status === "error") {
          console.log(res.error?.message);
          this.openMessageDialog("Redeem error.", res.error?.message);
          this._notify.update(
            "This didn't go as planned. Please try a bit later.",
            "error",
          );
          return;
        }
        console.log("Redeem registered.");
        this.loginUser();
      } finally {
        this._progress.hide();
      }
    }
  }

  async loginUser() {
    try {
      this._progress.show();
      await this._authService.emailLogin(
        this.form.value.password + "." + this.form.value.email,
        this.form.value.password,
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

      await this._router.navigate(["/manage-order/order-details"]);
      return;
    }
    console.log("Email not verified.");
  }

  async logInDirect() {
    const user = await this._authService.currentUser;
    if (user && user.emailVerified) {
      this._notify.update("Welcome!", "success");

      await this._router.navigate(["/manage-order/order-details"]);
      return;
    }
  }

  openMessageDialog(header: string | undefined, msg: string | undefined) {
    const dialogRef = this.dialog.open(MessagePopupComponent, {
      data: {
        message_header: header,
        message_content: msg,
      },
    });
  }

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
