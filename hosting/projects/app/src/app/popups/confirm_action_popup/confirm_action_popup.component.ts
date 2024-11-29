import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";

@Component({
  selector: "confirm-action-popup",
  standalone: true,
  imports: [AsyncPipe, NgIf, MatDialogContent, MatDialogClose],
  templateUrl: "./confirm_action_popup.component.html",
  styleUrl: "./confirm_action_popup.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmActionPopupComponent implements OnInit {
  content_text: string = "";
  confirmation: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmActionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Action,
  ) {}

  ngOnInit() {
    // Unlocking
    if (this.data.action_name == "music unlock") {
      this.content_text = "You will unlock re-upload of music for this user.";
    }
    if (this.data.action_name == "slipmat unlock") {
      this.content_text = "You will unlock re-upload of slipmat for this user.";
    }
    if (this.data.action_name == "sleeve unlock") {
      this.content_text = "You will unlock re-upload of sleeve for this user.";
    }
    if (this.data.action_name == "label unlock") {
      this.content_text = "You will unlock re-upload of label for this user.";
    }
    if (this.data.action_name == "picture disc unlock") {
      this.content_text =
        "You will unlock re-upload of picture disc for this user.";
    }

    // Add-ons
    if (this.data.action_name == "add double album") {
      this.content_text =
        "You will add double album option to user and reset the music and designs upload.";
    }
    if (this.data.action_name == "add design services") {
      this.content_text = "You will add design services option for this user.";
    }
    if (this.data.action_name == "add online designer") {
      this.content_text = "You will add online designer option for this user.";
    }
    if (this.data.action_name == "add slipmat") {
      this.content_text = "You will add custom slipmat for this user.";
    }
    if (this.data.action_name == "add sleeve") {
      this.content_text = "You will add custom printed sleeve for this user.";
    }
    if (this.data.action_name == "add label") {
      this.content_text = "You will add custom printed label for this user.";
    }

    // Designer clear stage
    if (this.data.action_name == "clear stage") {
      this.content_text = "All your elements on the canvas will be deleted.";
    }
  }

  closeDialog(selection: boolean) {
    this.dialogRef.close(selection);
  }
}

export interface Action {
  action_name: string;
}
