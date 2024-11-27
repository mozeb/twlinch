import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import Konva from "konva";
import { PDFDocument, rgb } from "pdf-lib";
import { DeisgnTemplatesService } from "../../services/deisgn-templates.service";
import WebFont from "webfontloader";
import { CommonModule } from "@angular/common";
import { StorageBaseService } from "../../services/api-base/storage-base.service"; // Import CommonModule

@Component({
  selector: "designer-popup",
  standalone: true,
  imports: [AsyncPipe, NgIf, MatDialogContent, MatDialogClose, CommonModule],
  templateUrl: "./designer-popup.component.html",
  styleUrl: "./designer-popup.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class DesignerPopupComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<DesignerPopupComponent>,
    protected _designTemplatesService: DeisgnTemplatesService,
    protected _authService: AuthService,
    private _storageService: StorageBaseService,
  ) {}

  stage!: Konva.Stage; // The main stage
  layer!: Konva.Layer; // The main elements layer
  designMarksLayer!: Konva.Layer; // The marks layer
  maskedGroup!: Konva.Group; // The outline mask of the sleeve
  maskedPath!: Konva.Path; // The outline mask of the sleeve
  transformer!: Konva.Transformer; // Transformer for moving objects and rotating them
  objectNodes: Konva.Node[] = [];
  textNodes: Konva.Text[] = []; // Array to hold multiple images uploaded
  selectedObject: Konva.Node | null = null;

  // Default values of stage width and height
  stageWidth = 1200;
  stageHeight = 700;

  clipPath: any;
  sizeInfo: any;

  scale: number = 1;

  @ViewChild("cont") container!: ElementRef;

  // Object actions element - delete/rotate object
  @ViewChild("colorPicker") colorPicker!: ElementRef<HTMLInputElement>;
  @ViewChild("colorPickerButton", { static: false })
  colorPickerButton!: ElementRef<HTMLDivElement>;
  @ViewChild("optionsDiv", { static: false })
  optionsDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("optionsToggle", { static: false })
  layerPositionButton!: ElementRef<HTMLButtonElement>;

  @ViewChild("shapesSelectDiv", { static: false })
  shapesSelectDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("shapesToggleButon", { static: false })
  shapesToggleButton!: ElementRef<HTMLButtonElement>;

  @ViewChild("sides", { static: false })
  sleeveSidesDiv!: ElementRef<HTMLDivElement>;

  // Color Picker For Background
  @ViewChild("colorPickerBackground")
  colorPickerBackground!: ElementRef<HTMLInputElement>;

  // Font select div
  @ViewChild("fontsSelectDiv", { static: false })
  fontsSelectDiv!: ElementRef<HTMLDivElement>;

  // Font Select Button
  @ViewChild("fontSelectButton", { static: false })
  fontSelectButton!: ElementRef<HTMLDivElement>;

  // text align div
  @ViewChild("textAlignDiv", { static: false })
  textAlignDiv!: ElementRef<HTMLDivElement>;

  // Text align Button
  @ViewChild("textAlignButton", { static: false })
  textAlignButton!: ElementRef<HTMLDivElement>;

  // Text thickness Button
  @ViewChild("textThicknessButton", { static: false })
  textThicknessButton!: ElementRef<HTMLDivElement>;

  // Delete object Button
  @ViewChild("deleteObjectButton", { static: false })
  deleteObjectButton!: ElementRef<HTMLDivElement>;

  // Delete object Button
  @ViewChild("duplicateObjectButton", { static: false })
  duplicateObjectButton!: ElementRef<HTMLDivElement>;

  selectedColor: string = "#ff0000"; // Default color
  fontAlign = "left.svg";

  // Bools to display differnt options selector
  showOptions = false; // Controls the visibility of the options div
  showShapesSelect = false; // Controls the visibility of the shapes select div
  showFontSelect = false; // Controls the visibility of the font select div
  showTextAlignSelect = false; // Controls the visibility of the font select div

  // Fonts Selection
  fonts: string[] = [];
  selectedFont: string = "Ubuntu Mono"; // To store the selected font

  ngAfterViewInit() {
    this.createStage();
    this.loadFonts();
    this.listenOffStageClick();
  }

  listenOffStageClick() {
    // Add global click event to hide transformer when clicking outside the stage
    document.addEventListener("click", (event: MouseEvent) => {
      const container = this.stage.container(); // Get the stage container element
      const clickedNode = event.target as HTMLElement;

      if (container === clickedNode) {
        // If the clicked element is the container but not a stage object
        this.transformer.hide();
        this.selectedObject = this.maskedPath;
        this.setAvailableTools();
      }
    });
  }

  //////////////// CREATING MAIN STAGE ////////////////
  async createStage() {
    // Get the original size of svg path
    this.sizeInfo =
      await this._designTemplatesService.getWidthAndHeightOfPath("twelve");

    // Determine stage size based on visible width
    var computedStyle = getComputedStyle(this.container.nativeElement);
    var elementWidth = this.container.nativeElement.clientWidth;
    elementWidth -=
      parseFloat(computedStyle.paddingLeft) +
      parseFloat(computedStyle.paddingRight);

    // 80% of screen width
    this.stageWidth = elementWidth - (elementWidth / 100) * 20;

    // Make sure there is at least 150px space on top and bottom
    if (this.container.nativeElement.clientHeight - this.stageHeight < 300) {
      this.stageWidth = elementWidth - (elementWidth / 100) * 30;
    }

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
    this.scale = Math.min(scaleX, scaleY);

    // Create the Konva path for the mask background coloring
    this.maskedPath = new Konva.Path({
      data: this._designTemplatesService.twelveInchTemplate.maskPath,
      fill: "#dcdcdc",
      scale: { x: this.scale, y: this.scale },
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

    // Add a Transformer to the layer for resizing objects
    this.transformer = new Konva.Transformer({
      enabledAnchors: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "top-center",
        "bottom-center",
        "middle-left",
        "middle-right",
      ],
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
      if (!this.objectNodes.includes(e.target as Konva.Node)) {
        this.transformer.nodes([]); // Clear selection
        this.layer.draw();
        this.selectedObject = this.maskedPath;
        this.setAvailableTools();

        // Remove text edit stuff
        if (this.caret) {
          this.caret.destroy();
          clearInterval(this.caretInterval);
        }
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

    // Setup sides position text
    const pos =
      (this.container.nativeElement.clientHeight - this.stageHeight) / 2 - 50;
    // set sides marks div
    this.sleeveSidesDiv.nativeElement.style.top = pos + "px";
    this.sleeveSidesDiv.nativeElement.style.width = this.stageWidth + "px";

    // Set tools at the begining
    this.selectedObject = this.maskedPath;
    this.setAvailableTools();
  }

  // Function to add different shapes
  addShape(type: string) {
    let shape;
    if (type === "circle") {
      shape = new Konva.Circle({
        x: this.stageWidth / 2,
        y: this.stageHeight / 2,
        radius: 50,
        fill: "#000000",
        draggable: true,
      });
    } else if (type === "square") {
      shape = new Konva.Rect({
        x: this.stageWidth / 2 - 50,
        y: this.stageHeight / 2 - 50,
        width: 100,
        height: 100,
        fill: "#000000",
        draggable: true,
      });
    } else if (type === "triangle") {
      shape = new Konva.Line({
        x: this.stageWidth / 2 - 100,
        y: this.stageHeight / 2 - 110,
        points: [50, 150, 150, 150, 100, 75], // x1, y1, x2, y2, x3, y3
        fill: "#000000", // fill color
        closed: true, // close the shape to form a triangle
        draggable: true,
      });
    } else {
      shape = new Konva.Circle({
        x: this.stageWidth / 2,
        y: this.stageHeight / 2,
        radius: 50,
        fill: "#00000",
        draggable: true,
      });
    }

    this.addShapeNodeEvents(shape);

    // Set up at the begining
    this.transformer.nodes([]);
    this.transformer.nodes([shape]);
    this.selectObject(shape);
    this.transformer.show();

    // Add shape to the layer
    this.maskedGroup.add(shape);
    this.layer.draw();

    this.setAvailableTools();

    this.showShapesSelect = false;
  }

  addShapeNodeEvents(shape: Konva.Shape) {
    this.objectNodes.push(shape);
    // Add click event to image for selecting and attaching transformer
    shape.on("click", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([shape]);
      this.layer.draw();
      this.selectObject(shape);
      this.setAvailableTools();
    });

    // Add drag event to shape for selecting and attaching transformer
    shape.on("dragmove", () => {
      // Detach transformer from previous node
      this.transformer.hide();
      this.selectObject(shape);
    });

    // Add drag end event to shape for selecting and attaching transformer
    shape.on("dragend", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([shape]);
      this.layer.draw();
      this.selectObject(shape);
      this.setAvailableTools();
    });

    // Hide the Transformer when rotating
    shape.on("transformstart", () => {
      this.transformer.hide(); // Hide transformer when rotation starts
      this.selectObject(shape);
      this.layer.draw();
    });

    // Show the Transformer again after rotation ends
    shape.on("transformend", () => {
      this.transformer.show(); // Show transformer after rotation ends
      this.selectObject(shape);
      this.layer.draw();
    });
  }

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  // Function to trigger the hidden file input
  triggerFileInput(): void {
    this.fileInput.nativeElement.click(); // Open file dialog
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
            x: this.stageWidth / 2 + this.stageWidth / 3 / 4, // Adjusted position within masked area
            y:
              this.stageHeight / 2 -
              ((this.stageWidth / 3) * imageObj.height) / imageObj.width / 2,
            width: this.stageWidth / 3, // Initial width
            height: ((this.stageWidth / 3) * imageObj.height) / imageObj.width, // Initial height
            draggable: true,
          });

          this.addShapeNodeEvents(konvaImage);

          // Add the image to the masked group
          this.maskedGroup.add(konvaImage);

          // Automatically attach transformer to the latest uploaded image
          this.selectObject(konvaImage);
          this.transformer.nodes([]);
          this.transformer.nodes([konvaImage]);
          this.transformer.show();
          this.layer.draw();
          this.setAvailableTools();
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
          color: rgb(0, 0.7, 1), // Set color for visibility
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

  ////////// Object actions ///////////

  // Call when selecting another object
  selectObject(object: Konva.Shape | Konva.Stage | Konva.Image) {
    this.selectedObject = object;

    if (!(object instanceof Konva.Image)) {
      const fillColor = (object as Konva.Shape).fill();
      this.colorPicker.nativeElement.value = fillColor.toString();
      this.colorPickerButton.nativeElement.style.backgroundColor =
        fillColor.toString();
    }
  }

  // Open the color select
  openColorPicker() {
    // Trigger the hidden color picker input
    this.colorPicker.nativeElement.click();
  }

  openBackgroundColorPicker() {
    // Trigger the hidden color picker input
    this.selectedObject = this.maskedPath;
    this.colorPickerBackground.nativeElement.click();
  }

  // Change the color
  onColorChange(event: Event) {
    // Update the selected color
    const input = event.target as HTMLInputElement;
    this.selectedColor = input.value;

    // If shape color picker
    if (this.selectedObject instanceof Konva.Shape) {
      (this.selectedObject as Konva.Shape).fill(input.value);
      // Update the custom button's background color
      this.colorPickerButton.nativeElement.style.backgroundColor =
        this.selectedColor;
    }
    // If background color picker
    else if (input.id == "colorPickerBackground") {
      this.maskedPath.fill(this.selectedColor);
    }
  }

  // Show options
  toggleOptions(event: MouseEvent) {
    const targetButton = event.target as HTMLButtonElement; // Assert the type
    this.showOptions = !this.showOptions; // Toggle the options div visibility
    if (this.showOptions) {
      // Get the button's position
      const buttonRect = targetButton.getBoundingClientRect();
      this.optionsDiv.nativeElement.style.left =
        targetButton.getBoundingClientRect().left + "px";
      this.optionsDiv.nativeElement.style.top =
        targetButton.getBoundingClientRect().bottom + "px";
    }
  }

  // Show shape select
  toggleShapes(event: MouseEvent) {
    const targetButton = event.target as HTMLButtonElement; // Assert the type
    this.showShapesSelect = !this.showShapesSelect; // Toggle the options div visibility
    if (this.showShapesSelect) {
      // Get the button's position
      this.shapesSelectDiv.nativeElement.style.left =
        targetButton.getBoundingClientRect().left +
        targetButton.clientWidth +
        "px";
      this.shapesSelectDiv.nativeElement.style.top =
        targetButton.getBoundingClientRect().top + "px";
    }
  }

  // Move selected layer
  moveLayer(direction: "up" | "down") {
    if (!this.selectedObject) {
      console.error("Layer is undefined.");
      return;
    }

    if (direction === "up") {
      this.selectedObject.moveUp(); // Moves the layer up by one step in the rendering order
    } else if (direction === "down") {
      // Prevent moving below the background layer

      this.selectedObject.moveDown(); // Moves the layer down by one step in the rendering order
    } else {
      console.error('Invalid direction. Use "up" or "down".');
    }
    // Redraw the stage to reflect the changes
    this.stage.batchDraw();
  }

  // Hide layer options when clicking outside
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.optionsDiv &&
      !this.optionsDiv.nativeElement.contains(target) &&
      this.layerPositionButton &&
      !this.layerPositionButton.nativeElement.contains(target)
    ) {
      //console.log("Clicked outside of the toggle");
      this.showOptions = false;
    }

    if (
      this.shapesSelectDiv &&
      !this.shapesSelectDiv.nativeElement.contains(target) &&
      this.shapesToggleButton &&
      !this.shapesToggleButton.nativeElement.contains(target)
    ) {
      //console.log("Clicked outside of the toggle");
      this.showShapesSelect = false;
    }

    if (
      this.fontSelectButton &&
      !this.fontSelectButton.nativeElement.contains(target)
    ) {
      //console.log("Clicked outside of the toggle");
      this.showFontSelect = false;
    }
  }

  ////////////////////////////////  All fonts related stuff   ////////////////////////////////////

  // Method to load needded fonts
  loadFonts() {
    const fontFamilies = [
      "Montserrat:400,700",
      "Ubuntu Mono:400,700",
      "Roboto:400,700",
      "Open Sans:400,700",
      "Lato:400,700",
      "Raleway:400,700",
      "Oswald:400,700",
      "Source Sans Pro:400,700",
      "Poppins:400,700",
      "Playfair Display:400,700",
      "Merriweather:400,700",
      "Nunito:400,700",
      "Quicksand:400,700",
      "Comfortaa:400,700",
      "Lobster:400",
      "Pacifico:400",
      "Dancing Script:400",
      "Amatic SC:400,700",
      "Shadows Into Light:400",
      "Caveat:400,700",
    ];

    WebFont.load({
      google: {
        families: fontFamilies,
      },
      active: () => {
        setTimeout(() => {
          this.fonts = fontFamilies.map((font) => font.split(":")[0]);
        });
      },
    });
  }

  selectFont(font: string): void {
    this.selectedFont = font; // Update the selected font
    if (this.selectedObject instanceof Konva.Text) {
      this.selectedObject.fontFamily(this.selectedFont);
      this.showFontSelect = false;
      this.transformer.forceUpdate();
      this.updateCaretPosition();
      this.layer.draw();
    }
  }

  // Add Text node and methods ////
  addTextNode(): void {
    const textNode = new Konva.Text({
      text: "Double Click To Edit",
      x: 50, // Initial x position
      y: 50, // Initial y position
      fontSize: 30 * this.scale,
      fontFamily: this.selectedFont,
      fill: "black",
      draggable: true,
      padding: 10,
      align: this.fontAlign.slice(0, -4),
    });

    this.layer.draw();

    this.addTextNodeEvents(textNode);

    // Set up at the begining
    this.transformer.nodes([]);
    this.transformer.nodes([textNode]);
    this.selectObject(textNode);
    this.transformer.show();
    this.maskedGroup.add(textNode);

    // Set available tools
    this.setAvailableTools();
  }

  addTextNodeEvents(textNode: Konva.Text) {
    this.objectNodes.push(textNode);
    // Add click event to image for selecting and attaching transformer
    textNode.on("click", () => {
      this.selectedFont = textNode.fontFamily();
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([textNode]);
      this.layer.draw();
      this.selectObject(textNode);
      this.setAvailableTools();
    });

    // Add drag event to shape for selecting and attaching transformer
    textNode.on("dragmove", () => {
      // Detach transformer from previous node
      this.transformer.hide();
      this.selectObject(textNode);
      this.endEditing();
    });

    //Add drag end event to shape for selecting and attaching transformer
    textNode.on("dragend", () => {
      this.selectedFont = textNode.fontFamily();
      this.editText();
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([textNode]);
      this.layer.draw();
      this.selectObject(textNode);
      this.setAvailableTools();
    });

    //Hide the Transformer when rotating
    textNode.on("transformstart", () => {
      this.transformer.hide(); // Hide transformer when rotation starts
      this.selectObject(textNode);
      this.layer.draw();
      this.endEditing();
    });

    //Show the Transformer again after rotation ends
    textNode.on("transformend", () => {
      this.editText();
      this.transformer.show(); // Show transformer after rotation ends
      this.selectObject(textNode);
      this.layer.draw();
    });

    textNode.on("dblclick", () => {
      this.selectedFont = textNode.fontFamily();
      this.selectObject(textNode);
      this.editText();
    });
  }

  caret!: Konva.Line;
  caretInterval: any;
  private onKeyDown: (event: KeyboardEvent) => void = () => {}; // Default value
  isEditing = false;
  caretPosition = { lineIndex: 0, charIndex: 0 };
  editText() {
    const textNode = this.selectedObject as Konva.Text;
    const scale = textNode.getAbsoluteScale(); // Get both X and Y scales
    const lineHeight = textNode.fontSize() * scale.x; // Get both X and Y scales
    let originalText = textNode.text();

    // Initialize caret position at the end of the text
    const lines = textNode.text().split("\n");
    this.caretPosition = {
      lineIndex: lines.length - 1, // Last line
      charIndex: lines[lines.length - 1].length, // End of last line
    };

    // Create a caret (blinking cursor)
    this.caret = new Konva.Line({
      points: [0, 0, 0, 0], // Will be updated dynamically
      stroke: "black",
      strokeWidth: 1,
      visible: true,
    });

    this.layer.add(this.caret);
    this.updateCaretPosition();
    this.layer.draw();

    // Blink caret
    this.caretInterval = setInterval(() => {
      if (this.caret) {
        this.caret.visible(!this.caret.visible());
        this.layer.draw();
      }
    }, 500);

    this.onKeyDown = (event: KeyboardEvent) => {
      const lines = textNode.text().split("\n");

      if (event.key === "Enter") {
        const currentLine = lines[this.caretPosition.lineIndex];
        const beforeCaret = currentLine.slice(0, this.caretPosition.charIndex);
        const afterCaret = currentLine.slice(this.caretPosition.charIndex);

        lines[this.caretPosition.lineIndex] = beforeCaret;
        lines.splice(this.caretPosition.lineIndex + 1, 0, afterCaret);

        this.caretPosition.lineIndex++;
        this.caretPosition.charIndex = 0;

        textNode.text(lines.join("\n"));
      } else if (event.key === "Backspace") {
        if (this.caretPosition.charIndex > 0) {
          // Remove the character behind the caret
          const currentLine = lines[this.caretPosition.lineIndex];
          lines[this.caretPosition.lineIndex] =
            currentLine.slice(0, this.caretPosition.charIndex - 1) +
            currentLine.slice(this.caretPosition.charIndex);
          this.caretPosition.charIndex--;
        } else if (this.caretPosition.lineIndex > 0) {
          // Merge current line with the previous line
          const currentLine = lines[this.caretPosition.lineIndex];
          const previousLine = lines[this.caretPosition.lineIndex - 1];
          this.caretPosition.charIndex = previousLine.length;

          lines[this.caretPosition.lineIndex - 1] += currentLine;
          lines.splice(this.caretPosition.lineIndex, 1);
          this.caretPosition.lineIndex--;
        }

        textNode.text(lines.join("\n"));
      } else if (event.key.length === 1) {
        // Add character at caret position
        const currentLine = lines[this.caretPosition.lineIndex];
        lines[this.caretPosition.lineIndex] =
          currentLine.slice(0, this.caretPosition.charIndex) +
          event.key +
          currentLine.slice(this.caretPosition.charIndex);

        this.caretPosition.charIndex++;

        textNode.text(lines.join("\n"));
      } else if (event.key === "ArrowLeft") {
        if (this.caretPosition.charIndex > 0) {
          this.caretPosition.charIndex--;
        } else if (this.caretPosition.lineIndex > 0) {
          this.caretPosition.lineIndex--;
          this.caretPosition.charIndex =
            lines[this.caretPosition.lineIndex].length;
        }
      } else if (event.key === "ArrowRight") {
        if (
          this.caretPosition.charIndex <
          lines[this.caretPosition.lineIndex].length
        ) {
          this.caretPosition.charIndex++;
        } else if (this.caretPosition.lineIndex < lines.length - 1) {
          this.caretPosition.lineIndex++;
          this.caretPosition.charIndex = 0;
        }
      } else if (event.key === "ArrowUp") {
        if (this.caretPosition.lineIndex > 0) {
          this.caretPosition.lineIndex--;
          this.caretPosition.charIndex = Math.min(
            this.caretPosition.charIndex,
            lines[this.caretPosition.lineIndex].length,
          );
        }
      } else if (event.key === "ArrowDown") {
        if (this.caretPosition.lineIndex < lines.length - 1) {
          this.caretPosition.lineIndex++;
          this.caretPosition.charIndex = Math.min(
            this.caretPosition.charIndex,
            lines[this.caretPosition.lineIndex].length,
          );
        }
      }

      this.updateCaretPosition();
      this.layer.draw();
    };

    window.addEventListener("keydown", this.onKeyDown);

    textNode.on("dragstart", () => {
      if (this.isEditing) {
        window.removeEventListener("keydown", this.onKeyDown);
        this.endEditing();
      }
    });

    textNode.on("transform", () => {
      if (this.isEditing) {
        window.removeEventListener("keydown", this.onKeyDown);
        this.endEditing();
      }
    });

    this.stage.on("click", () => {
      this.endEditing();
    });
  }

  updateCaretPosition() {
    const textNode = this.selectedObject as Konva.Text;
    const scale = textNode.getAbsoluteScale(); // Get both X and Y scales
    const lines = textNode.text().split("\n");
    const context = this.layer.getContext()._context; // Canvas 2D context
    const lineHeight = textNode.fontSize() * scale.x; // Calculate scaled line height

    // Set the context font to match the text node
    context.font = `${textNode.fontSize() * scale.x}px ${textNode.fontFamily()}`;

    const currentLine = lines[this.caretPosition.lineIndex];
    const textWidth = context.measureText(
      currentLine.slice(0, this.caretPosition.charIndex),
    ).width;

    // Calculate alignment offset
    const totalLineWidth = context.measureText(currentLine).width;
    let alignmentOffset = 0;

    if (textNode.align() === "center") {
      alignmentOffset = (textNode.width() * scale.x - totalLineWidth) / 2;
    } else if (textNode.align() === "right") {
      alignmentOffset =
        textNode.width() * scale.x - totalLineWidth - 10 * scale.x;
    } else {
      alignmentOffset = 10 * scale.x; // Default for left alignment
    }

    // Update caret position points
    this.caret.points([
      textNode.x() + alignmentOffset + textWidth,
      textNode.y() +
        lineHeight * (this.caretPosition.lineIndex + 1) -
        10 * scale.y,
      textNode.x() + alignmentOffset + textWidth,
      textNode.y() +
        lineHeight * (this.caretPosition.lineIndex + 1) +
        lineHeight -
        10 * scale.y,
    ]);
  }

  endEditing = () => {
    this.isEditing = false;
    if (this.caret) {
      this.caret.destroy();
    }
    clearInterval(this.caretInterval);
    window.removeEventListener("keydown", this.onKeyDown);
    this.layer.draw();
  };

  // Show options
  changeFont(event: MouseEvent) {
    const targetButton = event.target as HTMLButtonElement; // Assert the type
    this.showFontSelect = !this.showFontSelect; // Toggle the options div visibility
    if (this.showFontSelect) {
      // Get the button's position
      const buttonRect = targetButton.getBoundingClientRect();
      this.fontsSelectDiv.nativeElement.style.left =
        targetButton.getBoundingClientRect().left + "px";
      this.fontsSelectDiv.nativeElement.style.top =
        targetButton.getBoundingClientRect().bottom + "px";
    }
  }

  updateTextAlignment(alignment: "left" | "center" | "right"): void {
    this.fontAlign = alignment + ".svg";
    // End editing if text editing opened
    this.endEditing();
    if (["left", "center", "right"].includes(alignment)) {
      if (this.selectedObject instanceof Konva.Text) {
        this.selectedObject.align(alignment); // Update alignment
        this.layer.draw(); // Redraw the layer to apply changes
      } else {
        //console.error(`No font Selected`);
      }
    }
    this.showTextAlignSelect = !this.showTextAlignSelect; // Toggle the options div visibility
  }

  openTextAlignOptions() {
    this.showTextAlignSelect = !this.showTextAlignSelect; // Toggle the options div visibility
    if (this.showTextAlignSelect) {
      // Get the button's position
      this.textAlignDiv.nativeElement.style.left =
        this.textAlignButton.nativeElement.getBoundingClientRect().left + "px";
      this.textAlignDiv.nativeElement.style.top =
        this.textAlignButton.nativeElement.getBoundingClientRect().bottom +
        "px";
    }
  }

  //////////////////// END OF TEXT ////////////

  // Delete object
  deleteObject() {
    if (this.selectedObject !== this.maskedPath) {
      this.selectedObject?.destroy();
      this.transformer.hide();
      this.selectedObject = this.maskedPath;
      this.setAvailableTools();
      if (this.caret) {
        this.caret.destroy();
        clearInterval(this.caretInterval);
      }
    }
  }
  //
  // duplicateObject() {
  //   if (!this.selectedObject || this.selectedObject == this.maskedPath) {
  //     console.warn("No selected object to duplicate.");
  //     return;
  //   }
  //
  //   const duplicate = this.selectedObject.clone();
  //   duplicate.id("kreneki");
  //
  //   // Offset the duplicate's position to make it visually distinguishable
  //   duplicate.position({
  //     x: this.selectedObject.x() + this.selectedObject.width() / 2, // Offset by 20 pixels horizontally
  //     y: this.selectedObject.y() + this.selectedObject.height(), // Offset by 20 pixels vertically
  //   });
  //
  //   // Add the duplicate to the same layer
  //   this.maskedGroup.add(duplicate);
  //   this.transformer.nodes([]);
  //   this.transformer.nodes([duplicate]);
  //   this.transformer.show();
  //
  //   if (
  //     duplicate instanceof Konva.Shape &&
  //     !(duplicate instanceof Konva.Text)
  //   ) {
  //     this.addShapeNodeEvents(duplicate);
  //   } else if (duplicate instanceof Konva.Text) {
  //    // this.addTextNodeEvents(duplicate);
  //   }
  //
  //   // Redraw the layer to reflect the changes
  //   this.layer.draw();
  //
  //   // Optionally select the new object
  //   this.selectObject(duplicate);
  // }

  duplicateObject() {
    if (!this.selectedObject || this.selectedObject === this.maskedPath) {
      console.warn("No selected object to duplicate.");
      return;
    }

    let duplicate: Konva.Node;

    if (this.selectedObject instanceof Konva.Image) {
      // Handle Konva.Image duplication
      const imageNode = this.selectedObject as Konva.Image;

      duplicate = new Konva.Image({
        ...imageNode.attrs, // Copy all attributes
        image: imageNode.image(), // Explicitly pass the original image object
      });

      // Offset the position of the duplicate
      duplicate.position({
        x: imageNode.x() + imageNode.width() / 2,
        y: imageNode.y() + imageNode.height(),
      });

      this.addShapeNodeEvents(duplicate as Konva.Image); // Reattach events if needed
    } else {
      // For other node types, use toJSON and recreate
      const serialized = this.selectedObject.toJSON();
      duplicate = Konva.Node.create(serialized);

      duplicate.position({
        x: this.selectedObject.x() + this.selectedObject.width() / 2,
        y: this.selectedObject.y() + this.selectedObject.height(),
      });

      console.log(duplicate);
      if (duplicate instanceof Konva.Text) {
        console.log("Text");
        this.endEditing();
        this.addTextNodeEvents(duplicate as Konva.Text);
      } else if (duplicate instanceof Konva.Shape) {
        this.addShapeNodeEvents(duplicate as Konva.Shape);
      }
    }

    // Ensure the duplicate is a Shape or Group
    if (duplicate instanceof Konva.Shape) {
      // Add the duplicate to the masked group
      this.maskedGroup.add(duplicate);

      // Select the duplicate
      this.selectedObject = duplicate;
      this.selectObject(duplicate);

      // Update the transformer to target the duplicate
      this.transformer.nodes([duplicate]);

      // Redraw the layer
      this.layer.draw();
    } else {
      console.error("Duplicate is not a valid Shape or Group.");
    }
  }

  // Set available tools
  setAvailableTools() {
    if (this.selectedObject == this.maskedPath) {
      console.log(this.selectedObject);
      this.deleteObjectButton.nativeElement.classList.add("unclickable-button");
      this.duplicateObjectButton.nativeElement.classList.add(
        "unclickable-button",
      );
      this.textAlignButton.nativeElement.classList.add("unclickable-button");
      this.fontSelectButton.nativeElement.classList.add("unclickable-button");
      this.colorPickerButton.nativeElement.classList.add("unclickable-button");
      this.layerPositionButton.nativeElement.classList.add(
        "unclickable-button",
      );
      this.textThicknessButton.nativeElement.classList.add(
        "unclickable-button",
      );
    } else if (this.selectedObject instanceof Konva.Text) {
      this.textAlignButton.nativeElement.classList.remove("unclickable-button");
      this.fontSelectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.duplicateObjectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.deleteObjectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.colorPickerButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.layerPositionButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.textThicknessButton.nativeElement.classList.remove(
        "unclickable-button",
      );
    } else if (
      this.selectedObject instanceof Konva.Shape &&
      !(this.selectedObject instanceof Konva.Image)
    ) {
      this.textAlignButton.nativeElement.classList.add("unclickable-button");
      this.fontSelectButton.nativeElement.classList.add("unclickable-button");
      this.textThicknessButton.nativeElement.classList.add(
        "unclickable-button",
      );
      this.deleteObjectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.duplicateObjectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.colorPickerButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.layerPositionButton.nativeElement.classList.remove(
        "unclickable-button",
      );
    } else if (this.selectedObject instanceof Konva.Image) {
      this.colorPickerButton.nativeElement.classList.add("unclickable-button");
      this.textAlignButton.nativeElement.classList.add("unclickable-button");
      this.fontSelectButton.nativeElement.classList.add("unclickable-button");
      this.textThicknessButton.nativeElement.classList.add(
        "unclickable-button",
      );
      this.deleteObjectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.duplicateObjectButton.nativeElement.classList.remove(
        "unclickable-button",
      );
      this.layerPositionButton.nativeElement.classList.remove(
        "unclickable-button",
      );
    }
  }

  ///// GET MUSIC FILES  AND CREATE PLAYLIST TEXT NODE //////

  sideA: Array<string> = [];
  sideB: Array<string> = [];
  sideC: Array<string> = [];
  sideD: Array<string> = [];

  public async getMusicPlaylist() {
    const user = await this._authService.currentUser;
    this.sideA = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/A`,
    );
    this.sideB = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/B`,
    );
    this.sideC = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/C`,
    );
    this.sideD = await this._storageService.getFileName(
      `/orders/${user?.uid}/music/D`,
    );

    this.createPlaylistTextNode();
  }

  createPlaylistTextNode() {
    // Define starting position for the first text node
    let yOffset = 50; // Initial y position

    // Helper function to remove file extensions from an array of strings
    const removeExtensions = (tracks: string[]) => {
      return tracks.map(
        (track) => track.replace(/\.(wav|mp3|mp4|flac|aac|ogg|m4a|wma)$/i, ""), // Remove file extensions
      );
    };

    // Remove extensions from all playlist sides
    let cleanedSideA = removeExtensions(this.sideA);
    let cleanedSideB = removeExtensions(this.sideB);
    let cleanedSideC = removeExtensions(this.sideC);
    let cleanedSideD = removeExtensions(this.sideD);

    // Helper function to create and add text nodes
    const createTextNode = (text: string, x: number, y: number) => {
      const textNode = new Konva.Text({
        text: text,
        x: x,
        y: y,
        fontSize: 30 * this.scale,
        fontFamily: this.selectedFont,
        fill: "black",
        draggable: true,
        padding: 10,
        align: this.fontAlign.slice(0, -4),
      });

      // Add click event to image for selecting and attaching transformer
      textNode.on("click", () => {
        this.selectedFont = textNode.fontFamily();
        this.transformer.show();
        this.transformer.nodes([]);
        this.transformer.nodes([textNode]);
        this.layer.draw();
        this.selectObject(textNode);
        this.setAvailableTools();
      });

      // Add drag event to shape for selecting and attaching transformer
      textNode.on("dragmove", () => {
        // Detach transformer from previous node
        this.transformer.hide();
        this.selectObject(textNode);
        this.endEditing();
      });

      //Add drag end event to shape for selecting and attaching transformer
      textNode.on("dragend", () => {
        this.selectedFont = textNode.fontFamily();
        this.editText();
        this.transformer.show();
        this.transformer.nodes([]);
        this.transformer.nodes([textNode]);
        this.layer.draw();
        this.selectObject(textNode);
        this.setAvailableTools();
      });

      //Hide the Transformer when rotating
      textNode.on("transformstart", () => {
        this.transformer.hide(); // Hide transformer when rotation starts
        this.selectObject(textNode);
        this.updateCaretPosition();
        this.layer.draw();
        this.endEditing();
      });

      //Show the Transformer again after rotation ends
      textNode.on("transformend", () => {
        this.transformer.show(); // Show transformer after rotation ends
        this.editText();
        this.selectObject(textNode);
        this.layer.draw();
      });

      textNode.on("dblclick", () => {
        this.selectedFont = textNode.fontFamily();
        this.selectObject(textNode);
        this.editText();
      });

      // Set up at the begining
      this.transformer.nodes([]);
      this.transformer.nodes([textNode]);
      this.textNodes.push(textNode);
      this.maskedGroup.add(textNode);
      this.transformer.hide();
      this.selectObject(this.maskedPath);
    };

    // Add text nodes for each playlist side
    if (cleanedSideA.length > 0) {
      createTextNode(cleanedSideA.join("\n"), 50, yOffset);
      yOffset += cleanedSideA.length * 25; // Adjust yOffset for next node
    }
    if (cleanedSideB.length > 0) {
      createTextNode(cleanedSideB.join("\n"), 50, yOffset);
      yOffset += cleanedSideB.length * 25;
    }
    if (cleanedSideC.length > 0) {
      createTextNode(cleanedSideC.join("\n"), 50, yOffset);
      yOffset += cleanedSideC.length * 25;
    }
    if (cleanedSideD.length > 0) {
      createTextNode(cleanedSideD.join("\n"), 50, yOffset);
    }

    // Redraw the layer to reflect changes
    this.layer.draw();
  }

  ///////// END MUSIC FILES ///////////////////
}

// Track elements globally
interface KonvaElement {
  id: string;
  type: string;
  konvaObject: Konva.Node;
}
