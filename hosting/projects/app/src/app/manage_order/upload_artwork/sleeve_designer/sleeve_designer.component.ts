import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { AuthService } from "../../../services/auth.service";
import Konva from "konva";
import { StageComponent } from "ng2-konva";
import { PDFDocument, rgb } from "pdf-lib";
import { DeisgnTemplatesService } from "../../../services/deisgn-templates.service";

@Component({
  selector: "sleeve-designer",
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton, MatDialogModule, StageComponent],
  templateUrl: "./sleeve_designer.component.html",
  styleUrls: ["./sleeve_designer.component.scss"],
})
export class Sleeve_designerComponent implements OnInit, AfterViewInit {
  constructor(
    protected _authService: AuthService,
    protected _designTemplatesService: DeisgnTemplatesService,
  ) {}

  stage!: Konva.Stage; // The main stage
  layer!: Konva.Layer; // The main elements layer
  designMarksLayer!: Konva.Layer; // The marks layer
  maskedGroup!: Konva.Group; // The outline mask of the sleeve
  maskedPath!: Konva.Path; // The outline mask of the sleeve
  transformer!: Konva.Transformer; // Transformer for moving objects and rotating them
  imageNodes: Konva.Image[] = []; // Array to hold multiple images uploaded

  // Default values of stage width and height
  stageWidth = 1200;
  stageHeight = 700;

  clipPath: any;
  sizeInfo: any;

  @ViewChild("cont") container!: ElementRef;

  ngAfterViewInit() {
    this.createMask();
  }

  async createMask() {
    // Get the original size of svg path
    this.sizeInfo =
      await this._designTemplatesService.getWidthAndHeightOfPath("sleeve12");

    // Determine stage size based on visible width
    var computedStyle = getComputedStyle(this.container.nativeElement);
    var elementWidth = this.container.nativeElement.clientWidth;
    elementWidth -=
      parseFloat(computedStyle.paddingLeft) +
      parseFloat(computedStyle.paddingRight);

    this.stageWidth = elementWidth - 300;

    // Calculate the aspect ratio to determine height of Konva stage
    const aspectRatio = this.sizeInfo.height / this.sizeInfo.width;
    this.stageHeight = this.stageWidth * aspectRatio;

    // Get points for creating a bg mask
    const maskInfo = await this._designTemplatesService.getFixedPolygonPoints(
      this.stageWidth,
      this.stageHeight,
      this.sizeInfo.width,
      this.sizeInfo.height,
      this._designTemplatesService.twelveInchTemplate.maskPath,
    );

    // Create Konva Stage
    this.stage = new Konva.Stage({
      container: "cont",
      width: this.stageWidth,
      height: this.stageHeight,
    });

    // Create main Layer
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Calculate scaling factors to match the SVG dimensions to the stage
    const scaleX = this.stageWidth / this.sizeInfo.width;
    const scaleY = this.stageHeight / this.sizeInfo.height;
    const scale = Math.min(scaleX, scaleY);

    // Create the Konva path for the mask background coloring
    this.maskedPath = new Konva.Path({
      data: this._designTemplatesService.twelveInchTemplate.maskPath,
      fill: "lightgray",
      scale: { x: scale, y: scale },
      x: 0,
      y: 0,
    });
    this.layer.add(this.maskedPath);

    // Create bounding mask for limit of objects placing
    this.maskedGroup = new Konva.Group({
      clipFunc: (ctx) => {
        ctx.beginPath();
        ctx.moveTo(maskInfo.points[0].x, maskInfo.points[0].y); // Start at the first point
        maskInfo.points.forEach((point, index) => {
          if (index > 0) ctx.lineTo(point.x, point.y); // Draw lines to each subsequent point
        });
        ctx.closePath();
        ctx.clip(); // Apply clipping
      },
    });
    this.layer.add(this.maskedGroup);

    // Add a draggable circle to be masked within the group
    const circle = new Konva.Circle({
      x: 250,
      y: 200,
      radius: 50,
      fill: "blue",
      draggable: true, // Make the circle draggable
    });
    this.maskedGroup.add(circle);

    // Add a Transformer to the layer for resizing objects
    this.transformer = new Konva.Transformer({
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      boundBoxFunc: (oldBox, newBox) => {
        // Limit resize to avoid negative width/height
        if (newBox.width < 10 || newBox.height < 10) {
          return oldBox;
        }
        return newBox;
      },
    });
    this.layer.add(this.transformer);

    // Stage click event for deselecting when clicking away
    this.stage.on("click", (e) => {
      // Check if clicked target is NOT an image
      if (!this.imageNodes.includes(e.target as Konva.Image)) {
        this.transformer.nodes([]); // Clear selection
        this.layer.draw();
      }
    });

    // Add design marks and keep layer on top of others
    this.designMarksLayer = new Konva.Layer({ listening: false }); // Make this layer non-interactive
    this.stage.add(this.designMarksLayer);
    const designMarks =
      await this._designTemplatesService.loadDesignMarksOverlay(
        this.stageWidth,
        this.stageHeight,
        "twelve",
      );
    this.designMarksLayer.add(designMarks);
    this.designMarksLayer.draw();

    // Draw the main layer
    this.layer.draw();
  }

  // When user select a file from computer/device
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const imageObj = new Image();
        imageObj.src = e.target.result;

        imageObj.onload = () => {
          if (!this.maskedGroup) {
            console.error("Masked group is not initialized");
            return;
          }

          // Create the Konva image
          const konvaImage = new Konva.Image({
            image: imageObj,
            x: 100, // Adjusted position within masked area
            y: 100,
            width: imageObj.width / 2, // Initial width
            height: imageObj.height / 2, // Initial height
            draggable: true,
          });

          // Add the image to the masked group
          this.maskedGroup.add(konvaImage);
          this.imageNodes.push(konvaImage); // Add image to array for later reference

          // Add click event to image for selecting and attaching transformer
          konvaImage.on("click", () => {
            // Detach transformer from previous node
            this.transformer.nodes([]);
            // Attach transformer to clicked image
            this.transformer.nodes([konvaImage]);
            this.layer.draw();
          });

          // Automatically attach transformer to the latest uploaded image
          this.transformer.nodes([konvaImage]);
          this.layer.draw();
        };
      };

      reader.onerror = (error) => console.log("Error loading image:", error);
      reader.readAsDataURL(file);
    }
  }

  async saveSleevePDF() {
    // Hide Marks Layer
    this.designMarksLayer.hide();

    const highQualityPixelRatio = 3;
    const svgPath = this._designTemplatesService.twelveInchTemplate.cutMarksSvg; // Path to your SVG file in the assets folder

    // Export the stage as an image with high pixel ratio
    const dataURL = this.stage.toDataURL({ pixelRatio: highQualityPixelRatio });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([this.sizeInfo.width, this.sizeInfo.height]);

    // Embed and draw the stage image first
    const image = await pdfDoc.embedPng(dataURL);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: this.sizeInfo.width,
      height: this.sizeInfo.height,
    });

    // Fetch the SVG and extract path data
    const svgResponse = await fetch(svgPath);
    if (!svgResponse.ok)
      throw new Error(`Failed to load SVG: ${svgResponse.statusText}`);
    const svgText = await svgResponse.text();

    // Extract path data
    const svgPaths = svgText.match(/<path[^>]*d="([^"]*)"/g) || [];
    const paths = svgPaths.map((path) => {
      const match = path.match(/d="([^"]*)"/);
      return match ? match[1] : "";
    });

    // Render the cut marks
    paths.forEach((pathData, index) => {
      try {
        page.drawSvgPath(pathData, {
          x: 0,
          y: this.sizeInfo.height,
          scale: 1,
          color: rgb(0, 0, 0), // Set color for visibility
        });
        console.log(`Path ${index + 1} drawn successfully.`);
      } catch (error) {
        console.error(`Error drawing path ${index + 1}:`, error);
      }
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "masked-content-with-svg-overlay.pdf";
    link.click();
    URL.revokeObjectURL(url);

    // Show marks again
    this.designMarksLayer.show();
  }

  ngOnInit() {}

  innerHeight: string | undefined;
  innerWidth: number | undefined;

  // resize event listener for window adapting
  @HostListener("window:resize", ["$event"])
  onResize($event: Event) {
    this.innerHeight = window.innerHeight + "px";
    this.innerWidth = window.innerWidth;
  }
}
function ngOnInit() {
  throw new Error("Function not implemented.");
}

interface Window {
  Image: {
    prototype: HTMLImageElement;
    new (): HTMLImageElement;
  };
}
