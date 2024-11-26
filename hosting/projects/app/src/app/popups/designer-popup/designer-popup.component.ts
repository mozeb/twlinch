import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";
import Konva from "konva";
import { PDFDocument, rgb } from "pdf-lib";
import { DeisgnTemplatesService } from "../../services/deisgn-templates.service";
import WebFont from "webfontloader";
import { CommonModule } from "@angular/common"; // Import CommonModule

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
  ) {}

  stage!: Konva.Stage; // The main stage
  layer!: Konva.Layer; // The main elements layer
  designMarksLayer!: Konva.Layer; // The marks layer
  maskedGroup!: Konva.Group; // The outline mask of the sleeve
  maskedPath!: Konva.Path; // The outline mask of the sleeve
  transformer!: Konva.Transformer; // Transformer for moving objects and rotating them
  imageNodes: Konva.Image[] = []; // Array to hold multiple images uploaded
  shapeNondes: Konva.Shape[] = []; // Array to hold multiple images uploaded
  textNodes: Konva.Text[] = []; // Array to hold multiple images uploaded
  elements: KonvaElement[] = [];
  selectedObject: Konva.Node | null = null;

  generateId = (): string =>
    `element-${Math.random().toString(36).substr(2, 9)}`;

  // Default values of stage width and height
  stageWidth = 1200;
  stageHeight = 700;

  clipPath: any;
  sizeInfo: any;

  scale: number = 1;

  @ViewChild("cont") container!: ElementRef;

  // Object actions element - delete/rotate object
  @ViewChild("objectActions", { static: false })
  objectActions!: ElementRef<HTMLDivElement>;
  @ViewChild("colorPicker") colorPicker!: ElementRef<HTMLInputElement>;
  @ViewChild("colorPickerButton", { static: false })
  colorPickerButton!: ElementRef<HTMLDivElement>;
  @ViewChild("optionsDiv", { static: false })
  optionsDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("optionsToggle", { static: false })
  toggleButton!: ElementRef<HTMLButtonElement>;

  @ViewChild("shapesSelectDiv", { static: false })
  shapesSelectDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("shapesToggleButon", { static: false })
  shapesToggleButton!: ElementRef<HTMLButtonElement>;

  @ViewChild("sides", { static: false })
  sleeveSidesDiv!: ElementRef<HTMLDivElement>;

  // Color Picker For Background
  @ViewChild("colorPickerBackground")
  colorPickerBackground!: ElementRef<HTMLInputElement>;

  // Setup font
  @ViewChild("fontsSelectDiv", { static: false })
  fontsSelectDiv!: ElementRef<HTMLDivElement>;

  // Setup font
  @ViewChild("fontSelectButton", { static: false })
  fontSelectButton!: ElementRef<HTMLDivElement>;

  selectedColor: string = "#ff0000"; // Default color
  showOptions = false; // Controls the visibility of the options div
  showShapesSelect = false; // Controls the visibility of the shapes select div
  showFontSelect = false; // Controls the visibility of the font select div

  // Undo and redo stack
  undoStack: string[] = [];
  redoStack: string[] = [];

  // Fonts Selection
  fonts: string[] = [];
  selectedFont: string = "Ubuntu Mono"; // To store the selected font

  ngAfterViewInit() {
    this.createMask();
    this.loadFonts();
  }

  async createMask() {
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
    if (this.container.nativeElement.clientHeight - this.stageWidth < 300) {
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
      fill: "lightgray",
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
      if (
        !this.imageNodes.includes(e.target as Konva.Image) &&
        !this.shapeNondes.includes(e.target as Konva.Shape) &&
        !this.textNodes.includes(e.target as Konva.Text)
      ) {
        this.transformer.nodes([]); // Clear selection
        this.objectActions.nativeElement.style.display = "none"; // Remove actions
        this.layer.draw();

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

    // Add event listener to save state on changes
    this.saveState();

    // Save state on content layer changes
    this.layer.on("mouseup touchend", () => {
      this.saveState();
    });

    // Setup sides position text
    const pos =
      (this.container.nativeElement.clientHeight - this.stageHeight) / 2 - 50;
    // set sides marks div
    this.sleeveSidesDiv.nativeElement.style.top = pos + "px";
    this.sleeveSidesDiv.nativeElement.style.width = this.stageWidth + "px";
  }

  // Function to add different shapes
  addShape(type: string) {
    // Save state for undo/redo
    this.saveState();

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

    // Add click event to image for selecting and attaching transformer
    shape.on("click", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([shape]);
      this.layer.draw();
      this.selectObject(shape);
      this.updateActionsPosition();
    });

    // Add drag event to shape for selecting and attaching transformer
    shape.on("dragmove", () => {
      // Detach transformer from previous node
      this.transformer.hide();
      this.objectActions.nativeElement.style.display = "none";
      this.selectObject(shape);
    });

    // Add drag end event to shape for selecting and attaching transformer
    shape.on("dragend", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([shape]);
      this.layer.draw();
      this.selectObject(shape);
      this.updateActionsPosition();
    });

    // Hide the Transformer when rotating
    shape.on("transformstart", () => {
      this.transformer.hide(); // Hide transformer when rotation starts
      this.objectActions.nativeElement.style.display = "none";
      this.selectObject(shape);
      this.layer.draw();
    });

    // Show the Transformer again after rotation ends
    shape.on("transformend", () => {
      this.transformer.show(); // Show transformer after rotation ends
      this.updateActionsPosition();
      this.selectObject(shape);
      this.layer.draw();
    });

    // Create unique ID
    const id = this.generateId();
    const newElement: KonvaElement = {
      id: id,
      type: "Shape",
      konvaObject: shape,
    };
    this.elements.push(newElement);

    // Set up at the begining
    this.transformer.nodes([]);
    this.transformer.nodes([shape]);
    this.selectObject(shape);
    this.transformer.show();
    this.updateActionsPosition();

    // Add shape to the layer
    this.maskedGroup.add(shape);
    this.shapeNondes.push(shape); // Add image to array for later reference
    this.layer.draw();

    const layersList = document.getElementById(
      "layers-list",
    ) as HTMLUListElement;

    // Add to layers
    this.addElementToLayersPanel(
      shape,
      this.layer,
      this.transformer,
      layersList,
    );

    this.showShapesSelect = false;
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

          const layersList = document.getElementById(
            "layers-list",
          ) as HTMLUListElement;

          // Add to layers
          this.addElementToLayersPanel(
            konvaImage,
            this.layer,
            this.transformer,
            layersList,
          );

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

  // Function to add any Konva element to the layers panel with delete functionality
  addElementToLayersPanel(
    element: Konva.Node,
    layer: Konva.Layer,
    transformer: Konva.Transformer,
    layersList: HTMLUListElement,
  ) {
    // Create a list item for the element
    const listItem = document.createElement("li");
    listItem.classList.add("layer-item");
    listItem.textContent = `${element.getClassName()} ${element._id}`; // Dynamically get the element type and ID

    // Create a delete button for the element
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");

    // Set delete button functionality
    deleteButton.onclick = function () {
      element.destroy(); // Remove the element from the layer
      transformer.detach(); // Detach the transformer if applied
      layer.draw(); // Redraw the layer
      listItem.remove(); // Remove the entry from the layers panel

      // Hide the transformer if no other nodes are selected
      if (transformer.nodes().length === 0) {
        transformer.hide();
        layer.draw();
      }
    };

    listItem.appendChild(deleteButton);
    layersList.appendChild(listItem);

    // Optional: Add click functionality to focus on the selected element
    listItem.onclick = function () {
      transformer.nodes([element]); // Attach transformer to this element
      transformer.show();
      layer.draw(); // Redraw the layer
    };
  }

  ////////// Object actions ///////////

  // Delete object
  deleteObjectAction() {
    this.selectedObject?.remove();
    this.transformer.hide();
    this.objectActions.nativeElement.style.display = "none";
  }

  // Object position update
  updateActionsPosition() {
    let box = this.transformer.getClientRect();
    if (this.selectedObject) {
      box = this.selectedObject.getClientRect(); // Get the bounding box of the Transformer
    }
    const containerBox = this.stage.container().getBoundingClientRect(); // Get the container's bounding box

    this.objectActions.nativeElement.style.display = "block";
    this.objectActions.nativeElement.style.left = `${box.x + (this.stage.container().clientWidth - this.stage.width()) / 2 + this.transformer.width() / 2 - this.objectActions.nativeElement.clientWidth / 2}px`;
    this.objectActions.nativeElement.style.top = `${box.y + (this.stage.container().clientHeight - this.stage.height()) / 2 - this.objectActions.nativeElement.clientHeight - 20}px`;
  }

  // Call when selecting another object
  selectObject(object: Konva.Shape | Konva.Stage) {
    this.selectedObject = object;
    const fillColor = (object as Konva.Shape).fill();
    this.colorPicker.nativeElement.value = fillColor.toString();
    this.colorPickerButton.nativeElement.style.backgroundColor =
      fillColor.toString();
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
      this.toggleButton &&
      !this.toggleButton.nativeElement.contains(target)
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
    });
    // Store the font family names for selection (exclude weights for display)
    this.fonts = fontFamilies.map((font) => font.split(":")[0]);
  }

  selectFont(font: string): void {
    this.selectedFont = font; // Update the selected font
    if (this.selectedObject instanceof Konva.Text) {
      this.selectedObject.fontFamily(this.selectedFont);
      this.showFontSelect = false;
      this.transformer.forceUpdate();
      this.layer.draw();
    }
  }

  // Add Text node and methods ////
  addTextNode(): void {
    const textNode = new Konva.Text({
      text: "Double Click To Edit",
      x: 50, // Initial x position
      y: 50, // Initial y position
      fontSize: 20,
      fontFamily: this.selectedFont,
      fill: "black",
      draggable: true,
      padding: 10,
    });

    this.layer.draw();

    // Add click event to image for selecting and attaching transformer
    textNode.on("click", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([textNode]);
      this.layer.draw();
      this.selectObject(textNode);
      this.updateActionsPosition();
    });

    // Add drag event to shape for selecting and attaching transformer
    textNode.on("dragmove", () => {
      // Detach transformer from previous node
      this.transformer.hide();
      this.objectActions.nativeElement.style.display = "none";
      this.selectObject(textNode);
    });

    //Add drag end event to shape for selecting and attaching transformer
    textNode.on("dragend", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([textNode]);
      this.layer.draw();
      this.selectObject(textNode);
      this.updateActionsPosition();
    });

    //Hide the Transformer when rotating
    textNode.on("transformstart", () => {
      this.transformer.hide(); // Hide transformer when rotation starts
      this.objectActions.nativeElement.style.display = "none";
      this.selectObject(textNode);
      this.layer.draw();
    });

    //Show the Transformer again after rotation ends
    textNode.on("transformend", () => {
      this.transformer.show(); // Show transformer after rotation ends
      this.updateActionsPosition();
      this.selectObject(textNode);
      this.layer.draw();
    });

    textNode.on("dblclick", () => {
      this.selectObject(textNode);
      this.editText();
    });

    // Set up at the begining
    this.transformer.nodes([]);
    this.transformer.nodes([textNode]);
    this.textNodes.push(textNode);
    this.selectObject(textNode);
    this.transformer.show();
    this.maskedGroup.add(textNode);
  }

  caret!: Konva.Line;
  caretInterval: any;

  editText() {
    let isEditing = false;
    const textNode = this.selectedObject as Konva.Text;
    const scale = textNode.getAbsoluteScale(); // Get both X and Y scales
    const lineHeight = textNode.fontSize() * scale.x; // Get both X and Y scales
    let onKeyDown: (event: KeyboardEvent) => void;

    const endEditing = () => {
      isEditing = false;
      if (this.caret) {
        this.caret.destroy();
      }
      clearInterval(this.caretInterval);
      window.removeEventListener("keydown", onKeyDown);
      this.layer.draw();
    };

    // Blink caret
    this.caretInterval = setInterval(() => {
      this.caret.visible(!this.caret.visible());
      this.layer.draw();
    }, 500);

    if (!isEditing) {
      isEditing = true;
      const originalText = textNode.text();

      const getCurrentLineWidth = () => {
        const lines = textNode.text().split("\n");
        const currentLine = lines[lines.length - 1]; // Get the last line
        const context = this.layer.getContext()._context; // Canvas 2D context
        context.font = `${textNode.fontSize() * scale.x}px ${textNode.fontFamily()}`;
        return (
          context.measureText(currentLine).width + textNode.padding() * scale.x
        );
      };

      const lines = textNode.text().split("\n");
      const textWidth = getCurrentLineWidth();

      // Create a caret (blinking cursor)
      this.caret = new Konva.Line({
        points: [
          textNode.x() + textWidth,
          textNode.y() + lineHeight * lines.length - 10 * scale.x,
          textNode.x() + textWidth,
          textNode.y() + lineHeight * lines.length + lineHeight - 10 * scale.x,
        ],
        stroke: "black",
        strokeWidth: 1,
        visible: true,
      });

      this.layer.add(this.caret);
      this.layer.draw();

      onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          // Finish editing
          // Add a line break
          textNode.text(textNode.text() + "\n");

          // Move caret to the new line
          const lines = textNode.text().split("\n");
          const textWidth = getCurrentLineWidth();

          this.caret.points([
            textNode.x() + textWidth,
            textNode.y() + lineHeight * lines.length - 10 * scale.x,
            textNode.x() + textWidth,
            textNode.y() +
              lineHeight * lines.length +
              lineHeight -
              10 * scale.x,
          ]);

          this.layer.draw();
        } else if (event.key === "Escape") {
          // Cancel editing
          textNode.text(originalText);
          isEditing = false;
          window.removeEventListener("keydown", onKeyDown);
          endEditing();

          // Update transformer to revert to original text
          this.transformer.forceUpdate();
          this.layer.draw();
        } else {
          // Handle text typing
          if (event.key.length === 1 || event.key === "Backspace") {
            if (event.key === "Backspace") {
              textNode.text(textNode.text().slice(0, -1));
            } else {
              textNode.text(textNode.text() + event.key);
            }

            // Move caret
            const textWidth = getCurrentLineWidth();
            const lines = textNode.text().split("\n");
            // Update caret position dynamicallydth;
            this.caret.points([
              textNode.x() + textWidth,
              textNode.y() + lineHeight * lines.length - 10 * scale.x,
              textNode.x() + textWidth,
              textNode.y() +
                lineHeight * lines.length +
                lineHeight -
                10 * scale.x,
            ]);

            // Update transformer
            this.transformer.forceUpdate();
            this.layer.draw();
          }
        }
      };

      // Listen to typing events
      window.addEventListener("keydown", onKeyDown);
    }

    // Detect drag events to finish editing
    textNode.on("dragstart", () => {
      if (isEditing) {
        window.removeEventListener("keydown", onKeyDown);
        endEditing();
      }
    });

    // Detect resize events to finish editing
    textNode.on("transform", () => {
      if (isEditing) {
        window.removeEventListener("keydown", onKeyDown);
        endEditing();
      }
    });

    // End editing text if user clicks outside the text node
    this.stage.on("click", (e) => {
      // Check if clicked target is NOT an image
      endEditing();
    });
  }

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

  // Undo and redo states save and actions ///
  saveState() {
    // Save the current state of the content layer
    this.undoStack.push(this.layer.toJSON());
    this.redoStack = []; // Clear the redo stack
  }

  undo() {
    if (this.undoStack.length > 1) {
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
    }
  }
}

// Track elements globally
interface KonvaElement {
  id: string;
  type: string;
  konvaObject: Konva.Node;
}
