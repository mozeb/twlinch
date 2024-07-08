import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import * as fabric from "fabric";

import { LodashToPath } from "lodash/fp";
import { Image } from "fabric/fabric-impl";

@Component({
  selector: "upload-artwork",
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton, MatDialogModule],
  templateUrl: "./upload_artwork.component.html",
  styleUrls: ["./upload_artwork.component.scss"],
})
export class Upload_artworkComponent implements OnInit, AfterViewInit {
  constructor(protected _authService: AuthService) {}

  sceneWidth = 900;
  sceneHeight = 800;

  width = 900;
  height = 800;

  async ngAfterViewInit() {
    let fCanvas = new fabric.Canvas("myCanvas", {
      width: 500,
      height: 500,
      fill: "green",
      backgroundColor: "green",
    });

    let circle2 = new fabric.Circle({
      radius: 50,
      fill: "red",
      left: 100,
      top: 100,
      stroke: "black",
      strokeWidth: 4,
    });
    fCanvas.add(new fabric.Textbox("Hello Fabric!"));
    fCanvas.add(circle2);
    fCanvas.requestRenderAll();

    const a = fabric.Image.fromURL(
      "/assets/Pending_Icon.svg",
      {},
      {
        width: 300,
        scaleX: 0.1,
      },
    );

    fCanvas.add(await a);
    fCanvas.requestRenderAll();
  }

  //canvasEl = document.getElementById("myCanvas");

  //scale = Math.max(this.scaleX, this.scaleY);

  ngOnInit() {
    this.innerHeight = window.innerHeight + "px";
  }

  // public configPath: PathConfig = {
  //   x: 0,
  //   y: 0,
  //   fill: "green",
  //   data: "M908.59,0h-10.09v9.92H0v892.91h898.5v9.93h908.59V0h-898.5Z",
  //   scaleX: 0.4,
  //   scaleY: 0.4,
  // };

  innerHeight: string | undefined;

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
  }
}
