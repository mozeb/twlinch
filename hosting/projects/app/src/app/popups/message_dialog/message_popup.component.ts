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
  selector: "message-popup",
  standalone: true,
  imports: [AsyncPipe, NgIf, MatDialogContent, MatDialogClose],
  templateUrl: "./message_popup.component.html",
  styleUrl: "./message_popup.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class MessagePopupComponent implements OnInit {
  content_text: string = "";
  header_text: string = "";

  constructor(
    public dialogRef: MatDialogRef<MessagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Message,
  ) {}

  ngOnInit() {
    // Show Message
    this.content_text = this.data.message_content;
    this.header_text = this.data.message_header;
  }

  closeDialog(selection: boolean) {
    this.dialogRef.close(selection);
  }
}

export interface Message {
  message_header: string;
  message_content: string;
}
