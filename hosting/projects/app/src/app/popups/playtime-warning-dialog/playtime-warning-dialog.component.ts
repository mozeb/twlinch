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
  selector: "platime-warning-dialog",
  standalone: true,
  imports: [AsyncPipe, NgIf, MatDialogContent, MatDialogClose],
  templateUrl: "./playtime-warning-dialog.component.html",
  styleUrl: "./playtime-warning-dialog.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class PlaytimeWarningDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PlaytimeWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WarningData,
  ) {}
}

export interface WarningData {
  maxTime: string;
  yourTime: string;
}
