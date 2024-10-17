import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf, NgStyle } from "@angular/common";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";
import {
  twDesignOrderStatusColor,
  twDesignOrderStatusText,
  twRecordingOrderStatusColor,
  twRecordingOrderStatusText,
} from "../../services/interfaces";
import { FirestoreApiService } from "../../services/firestore-api.service";

@Component({
  selector: "tw-order-status-change-popup",
  standalone: true,
  imports: [AsyncPipe, NgIf, MatDialogContent, MatDialogClose, NgStyle],
  templateUrl: "./tw_order_status_change_popup.html",
  styleUrl: "./tw_order_status_change_popup.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class TwOrderStatusChangeComponent implements OnInit {
  change_type: string = "";
  header_text: string = "";

  constructor(
    public dialogRef: MatDialogRef<TwOrderStatusChangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Type,
    private _firestoreApiService: FirestoreApiService,
  ) {}

  ngOnInit() {
    this.header_text = this.data.header_text;
  }

  closeDialog(selection: boolean) {
    this.dialogRef.close(selection);
  }

  updateRecordingStatus(stauts: string) {
    this._firestoreApiService.mergeDoc(
      `shopOrders/${this.data.orderId as String}`,
      {
        tw_recording_order_status: stauts,
      },
    );
    this.dialogRef.close();
  }

  updateDesignStatus(stauts: string) {
    this._firestoreApiService.mergeDoc(
      `shopOrders/${this.data.orderId as String}`,
      {
        tw_design_order_status: stauts,
      },
    );
    this.dialogRef.close();
  }

  protected readonly twRecordingStatusText = twRecordingOrderStatusText;
  protected readonly twRecordingStatusColor = twRecordingOrderStatusColor;
  protected readonly twDesignStatusText = twDesignOrderStatusText;
  protected readonly twDesignStatusColor = twDesignOrderStatusColor;
}

export interface Type {
  change_type: string;
  orderId: string;
  header_text: string;
}
