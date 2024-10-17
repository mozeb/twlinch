import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { FirestoreApiService } from "../../services/firestore-api.service";
import { AuthService } from "../../services/auth.service";
import { ShopOrderJSON, WCOrderBilling } from "../../interfaces/shopOrder";
import { createUserWithEmailAndPassword } from "@angular/fire/auth";
import { MessagePopupComponent } from "../message_dialog/message_popup.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "add-shipping-details-popup",
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    MatDialogContent,
    MatDialogClose,
    MatError,
    MatFormField,
    ReactiveFormsModule,
    MatLabel,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: "./add_shipping_popup.component.html",
  styleUrl: "./add_shipping_popup.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class AddShippingDetailsPopupComponent implements OnInit {
  content_text: string = "";
  confirmation: boolean = false;
  //@ts-ignore
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddShippingDetailsPopupComponent>,
    private _fb: FormBuilder,
    private _firestoreService: FirestoreApiService,
    private _authService: AuthService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: WCOrderBilling,
  ) {}

  ngOnInit() {
    this.form = this._fb.group({
      First_Name: new FormControl(this.data?.first_name, [Validators.required]),
      Last_Name: new FormControl(this.data?.last_name, [Validators.required]),
      Street_Address: new FormControl(this.data?.address_1, [
        Validators.required,
      ]),
      Street_Address2: new FormControl(this.data?.address_2),
      State: new FormControl(this.data?.state),
      Post_Code: new FormControl(this.data?.postcode, [Validators.required]),
      Town: new FormControl(this.data?.city, [Validators.required]),
      Phone_Number: new FormControl(this.data?.phone, [Validators.required]),
      Email_Address: new FormControl(this.data?.email, [
        Validators.required,
        Validators.email,
      ]),
      Country: new FormControl(this.data?.country, [Validators.required]),
    });
  }

  async addShipping() {
    const user = await this._authService.currentUser;
    if (this.form.valid) {
      this._firestoreService.mergeDoc(`shopOrders/${user?.uid as string}`, {
        address_billing: {
          address_1: this.form.value.Street_Address,
          address_2: this.form.value.Street_Address2,
          city: this.form.value.Town,
          country: this.form.value.Country,
          postcode: this.form.value.Post_Code,
          phone: this.form.value.Phone_Number,
          state: this.form.value.State,
          first_name: this.form.value.First_Name,
          last_name: this.form.value.Last_Name,
          email: this.form.value.Email_Address,
        },
      });
      this.closeDialog(true);
    } else {
      this.openMessageDialog(
        "We need more shipping data.",
        "All required fields need to be filled out.",
      );
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

  closeDialog(selection: boolean) {
    this.dialogRef.close(selection);
  }
}
