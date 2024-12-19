import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import Konva from "konva";
import { PDFDocument, rgb } from "pdf-lib";
import {
  DeisgnTemplatesService,
  designTemplate,
} from "../../services/deisgn-templates.service";
import WebFont from "webfontloader";
import { CommonModule } from "@angular/common";
import { StorageBaseService } from "../../services/api-base/storage-base.service"; // Import CommonModule
import { ConfirmActionPopupComponent } from "../confirm_action_popup/confirm_action_popup.component";
import { DesignPreviewPopupComponent } from "../desing-preview-popup/design-preview-popup.component";
import { MatIcon } from "@angular/material/icon";
import { artworkType } from "../../services/transfer-service";
import {
  FormControl,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
} from "@angular/forms";

@Component({
  selector: "designer-popup",
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    MatDialogContent,
    MatDialogClose,
    CommonModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
  ],
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
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TwlDesigner,
  ) {}

  stage!: Konva.Stage; // The main stage

  labelsJSON: Record<LabelKeys, string> = {
    A: '{"group":{"attrs":{},"className":"Group","children":[]},"backgroundColor":"#dcdcdc"}',
    B: '{"group":{"attrs":{},"className":"Group","children":[]},"backgroundColor":"#dcdcdc"}',
    C: "",
    D: "",
  }; // Initialize with empty strings for all keys
  currentLabel = "A";

  designerTools: DesignTool[] = [
    {
      divId: "duplicateLabelsSelectDiv",
      triggerButtonId: "duplicateLabelsToggleButton",
      displayBool: false,
      toolType: "alwaysOn",
    },
    {
      divId: "shapesSelectDiv",
      triggerButtonId: "shapesToggleButon",
      displayBool: false,
      toolType: "alwaysOn",
    },
    {
      divId: "",
      triggerButtonId: "deleteObjectButton",
      displayBool: false,
      toolType: "all",
    },
    {
      divId: "",
      triggerButtonId: "colorPickerButton",
      displayBool: false,
      toolType: "color",
    },
    {
      divId: "",
      triggerButtonId: "duplicateObjectButton",
      displayBool: false,
      toolType: "all",
    },
    {
      divId: "textAlignDiv",
      triggerButtonId: "textAlignButton",
      displayBool: false,
      toolType: "text",
    },
    {
      divId: "layerPositionDiv",
      triggerButtonId: "positionElementButton",
      displayBool: false,
      toolType: "all",
    },
    {
      divId: "fontSelectDiv",
      triggerButtonId: "fontSelectButton",
      displayBool: false,
      toolType: "text",
    },
    {
      divId: "",
      triggerButtonId: "fontSizeButton",
      displayBool: false,
      toolType: "text",
    },
  ];

  previewImageLabelA: string = "";
  previewImageLabelB: string = "";
  previewImageLabelC: string = "";
  previewImageLabelD: string = "";
  previewSleeve: string = "";

  layer!: Konva.Layer; // The main elements layer
  designMarksLayer!: Konva.Layer; // The marks layer
  maskedGroup!: Konva.Group; // The outline mask of the sleeve
  maskedPath!: Konva.Path; // The outline mask of the sleeve
  transformer!: Konva.Transformer; // Transformer for moving objects and rotating them
  objectNodes: Konva.Node[] = [];
  textNodes: Konva.Text[] = []; // Array to hold multiple images uploaded
  selectedObject: Konva.Node | null = null;
  cutMarksPath: string = "";
  cutMarksColor = rgb(0, 0.7, 1);

  // Default values of stage width and height
  stageWidth = 1200;
  stageHeight = 700;

  clipPath: any;
  sizeInfo: any;

  scale: number = 1;

  fontSizeControl = new FormControl(20); // Initialize with default font s

  @ViewChild("cont") container!: ElementRef;

  // Object actions element - delete/rotate object
  @ViewChild("colorPicker") colorPicker!: ElementRef<HTMLInputElement>;
  @ViewChild("colorPickerButton", { static: false })
  colorPickerButton!: ElementRef<HTMLDivElement>;
  @ViewChild("optionsDiv", { static: false })
  optionsDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("positionElementButton", { static: false })
  layerPositionButton!: ElementRef<HTMLButtonElement>;

  @ViewChild("shapesSelectDiv", { static: false })
  shapesSelectDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("shapesToggleButon", { static: false })
  shapesToggleButton!: ElementRef<HTMLButtonElement>;

  @ViewChild("duplicateLabelsSelectDiv", { static: false })
  duplicateLabelsSelectDiv!: ElementRef<HTMLDivElement>;

  @ViewChild("duplicateLabelsToggleButton", { static: false })
  duplicateLabelsToggleButton!: ElementRef<HTMLDivElement>;

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

  // LAbels selector buttons
  @ViewChild("labelAButton", { static: false })
  labelAButton!: ElementRef<HTMLDivElement>;
  @ViewChild("labelBButton", { static: false })
  labelBButton!: ElementRef<HTMLDivElement>;
  @ViewChild("labelCButton", { static: false })
  labelCButton!: ElementRef<HTMLDivElement>;
  @ViewChild("labelDButton", { static: false })
  labelDButton!: ElementRef<HTMLDivElement>;

  labelsButtons: Record<LabelKeys, HTMLDivElement> = {} as Record<
    LabelKeys,
    HTMLDivElement
  >;

  selectedColor: string = "#ff0000"; // Default color
  fontAlign = "left.svg";

  // Fonts Selection
  fonts: string[] = [];
  selectedFont: string = "Ubuntu Mono"; // To store the selected font

  ngAfterViewInit() {
    // Load all fonts
    this.loadFonts();
    // Listen to clicks
    this.clickListener();
    // Setup all the info based on input from app
    this.setUpTwlinchDeisgner();
  }

  // Setup all the data for designer
  async setUpTwlinchDeisgner() {
    // Set stage tools
    this.setAvailableTools("stage");
    // Figure out if label/sleeve/slipmat/pdisc
    if (this.data.type === "label") {
      // Setup buttons array for labels
      if (this.labelAButton) {
        this.labelsButtons["A"] = this.labelAButton.nativeElement;
      }
      if (this.labelBButton) {
        this.labelsButtons["B"] = this.labelBButton.nativeElement;
      }
      if (this.labelCButton) {
        this.labelsButtons["C"] = this.labelCButton.nativeElement;
      }
      if (this.labelDButton) {
        this.labelsButtons["D"] = this.labelDButton.nativeElement;
      }
      this.labelsButtons["A"].style.color = "#fedc00";

      this.sizeInfo =
        await this._designTemplatesService.getWidthAndHeightOfPath(
          this.data.vinylSize as artworkType,
        );
      if (this.data.doubleAlbum) {
        this.sizeInfo =
          await this._designTemplatesService.getWidthAndHeightOfPath(
            "labelABCD" as artworkType,
          );
      }
      this.createStageForLabel();
    } else if (this.data.type === "sleeve") {
      this.sizeInfo =
        await this._designTemplatesService.getWidthAndHeightOfPath(
          this.data.vinylSize as artworkType,
        );
      this.createStageForSleeve(
        this._designTemplatesService.twelveInchTemplate,
      );
    }
  }

  // Listen to clicks on the view
  clickListener() {
    // Add global click event to hide transformer when clicking outside the stage
    document.addEventListener("click", (event: MouseEvent) => {
      const container = this.stage.container(); // Get the stage container element
      const clickedNode = event.target as HTMLElement;

      // Hide tools if not selected
      for (const tool of this.designerTools) {
        if (clickedNode.id != tool.triggerButtonId) {
          tool.displayBool = false;
          const toolElement = document.getElementById(
            tool.divId,
          ) as HTMLDivElement;
          if (toolElement) {
            toolElement.style.display = "none";
          }
        } else {
        }
      }

      // Select object inside stage if clicked
      if (container === clickedNode) {
        // If the clicked element is the container but not a stage object
        this.transformer.hide();
        this.selectedObject = this.maskedPath;
        this.setAvailableTools("stage");
      }
    });
  }

  //////////////// CREATING MAIN STAGE ////////////////
  async createStageForSleeve(template: designTemplate) {
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
        this.setAvailableTools("stage");

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
    this.setAvailableTools("shape");

    // Set cut marks path
    this.cutMarksPath =
      this._designTemplatesService.twelveInchTemplate.cutMarksSvg; // Path to your SVG file in the assets folder
  }

  async createStageForLabel() {
    // Check for dobule album and add emptry labels for C and D size
    if (this.data.doubleAlbum) {
      this.labelsJSON["C"] =
        '{"group":{"attrs":{},"className":"Group","children":[]},"backgroundColor":"#dcdcdc"}';
      this.labelsJSON["D"] =
        '{"group":{"attrs":{},"className":"Group","children":[]},"backgroundColor":"#dcdcdc"}';
    }

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

    if (this.stageWidth >= 560.56) {
      this.stageWidth = 560.56;
    }
    // Calculate the aspect ratio to determine height of Konva stage
    const aspectRatio = (this.sizeInfo.height * 2) / (this.sizeInfo.width * 2);
    this.stageHeight = this.stageWidth * aspectRatio;

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
    const scaleX = this.stageWidth / (this.sizeInfo.width * 2);
    const scaleY = this.stageHeight / (this.sizeInfo.height * 2);
    this.scale = Math.min(scaleX, scaleY);

    // Calculate the size
    let size = 0;
    if (280.28 * this.scale > 560.56) {
      size = 560.56;
    } else {
      size = 280.28 * this.scale;
    }

    const radius = size; // Half the width or height
    const centerX = size; // Center X (based on your path data)
    const centerY = size; // Center Y (based on your path data)

    // Generate an SVG path for the circle
    const circlePathData = `
  M ${centerX + radius},${centerY}
  A ${radius},${radius} 0 1,0 ${centerX - radius},${centerY}
  A ${radius},${radius} 0 1,0 ${centerX + radius},${centerY}`;

    // Create the Konva path for the circle
    this.maskedPath = new Konva.Path({
      data: circlePathData.trim(), // Use the generated circular path
      fill: "#dcdcdc", // Background color for the mask
      x: 0, // Align to top-left
      y: 0,
    });

    this.layer.add(this.maskedPath);

    // Create bounding mask for limiting objects placing
    this.maskedGroup = new Konva.Group({
      clipFunc: (ctx) => {
        // Define the same clipping logic as the circle path
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false); // Full circle
        ctx.closePath();
        ctx.clip(); // Apply clipping
      },
    });

    this.layer.add(this.maskedGroup);

    // Add design marks and keep layer on top of others
    this.designMarksLayer = new Konva.Layer({ listening: false }); // Make this layer non-interactive
    this.stage.add(this.designMarksLayer);
    const designMarks =
      await this._designTemplatesService.loadDesignMarksOverlay(
        this.stageWidth,
        this.stageHeight,
        "label",
      );
    this.designMarksLayer.add(designMarks);
    this.designMarksLayer.draw();

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

    // Add the group to the layer
    this.layer.add(this.maskedGroup);

    // Draw the main layer
    this.layer.draw();

    // Cut marks path
    this.cutMarksColor = rgb(0.92, 0.19, 0.5);
    this.cutMarksPath = this._designTemplatesService.labelTemplate.cutMarksSvg; // Path to your SVG file in the assets folder
  }

  async switchLabel(label: string) {
    // Set color o button
    for (const key in this.labelsButtons) {
      if (key == label) {
        this.labelsButtons[key as LabelKeys].style.color = "#fedc00";
      } else {
        this.labelsButtons[key as LabelKeys].style.color = "white";
      }
    }

    this.labelsJSON[this.currentLabel as LabelKeys] = this.saveGroup(
      this.maskedGroup,
    );

    this.clearStage();
    if (this.labelsJSON[label as LabelKeys]) {
      await this.switchLabelFill(this.labelsJSON[label as LabelKeys]);
    }
    this.currentLabel = label;
  }

  // Save the current label for later if switching
  saveGroup(group: Konva.Group): string {
    if (!group) {
      console.error("No group provided for saving.");
      return "";
    }
    // Iterate through the group's children to handle image nodes
    group.getChildren().forEach((node) => {
      if (node instanceof Konva.Image && node.image()) {
        const imgElement = node.image() as HTMLImageElement;
        if (imgElement.src) {
          // Save the image's source URL as a custom attribute
          node.setAttr("src", imgElement.src);
        }
      }
    });
    // Convert the group to JSON
    const groupJSON = group.toJSON();
    const output = {
      group: JSON.parse(groupJSON),
      backgroundColor: this.maskedPath.fill(),
    };
    return JSON.stringify(output);
  }

  // Method to fill the selected label
  async switchLabelFill(label: string) {
    const data = JSON.parse(label);
    const grp = Konva.Node.create(JSON.stringify(data.group)) as Konva.Group;
    this.maskedPath.fill(data.backgroundColor);

    for (const node of grp.getChildren()) {
      const clonedNode = node.clone();

      if (clonedNode instanceof Konva.Text) {
        this.addTextNodeEvents(clonedNode as Konva.Text);
      } else if (
        clonedNode instanceof Konva.Rect ||
        clonedNode instanceof Konva.Line ||
        clonedNode instanceof Konva.Circle
      ) {
        this.addShapeNodeEvents(clonedNode as Konva.Shape);
      } else if (clonedNode instanceof Konva.Image) {
        // Get the source and add image
        const src = node.getAttr("src"); // Get the custom src attribute
        if (src) {
          const img = await this.loadImage(src); // Await the image loading
          clonedNode.image(img); // Assign the loaded image to the node
        } else {
          console.error("Image node is missing src attribute:", node);
        }
        this.addShapeNodeEvents(clonedNode as Konva.Image);
      }

      this.maskedGroup.add(clonedNode);
    }

    this.maskedGroup.draw();
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  addShapeNodeEvents(shape: Konva.Shape) {
    this.objectNodes.push(shape);

    let objectType = "shape";
    if (shape instanceof Konva.Image) {
      objectType = "image";
    } else {
    }
    // Add click event to image for selecting and attaching transformer
    shape.on("click", () => {
      this.transformer.show();
      this.transformer.nodes([]);
      this.transformer.nodes([shape]);
      this.layer.draw();
      this.selectObject(shape);
      this.setAvailableTools(objectType);
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
      this.setAvailableTools(objectType);
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
          this.setAvailableTools("image");
        };
      };

      reader.onerror = (error) => console.log("Error loading image:", error);
      reader.readAsDataURL(file);
    }
  }

  // Method to save project depending on project type
  saveProject() {
    if (this.data.type == "sleeve") {
      this.saveSleevePDF();
    } else if (this.data.type == "label") {
      this.saveLabelsPDF();
    }
  }

  // Save Labels
  async saveLabelsPDF() {
    // Hide Marks Layer
    this.designMarksLayer.hide();
    const highQualityPixelRatio = 3;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Switch to current label to save current design
    await this.switchLabel(this.currentLabel);

    // Save each label to separate page
    for (const key in this.labelsJSON) {
      // Clear stage
      this.clearStage();

      // Add label just if not empty!
      if (this.labelsJSON[key as LabelKeys] !== "") {
        await this.switchLabelFill(this.labelsJSON[key as LabelKeys]);

        const dataURL = this.stage.toDataURL({
          pixelRatio: highQualityPixelRatio,
        });

        const page = pdfDoc.addPage([
          this.sizeInfo.width,
          this.sizeInfo.height,
        ]);

        // Embed and draw the stage image first
        const image = await pdfDoc.embedPng(dataURL);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: this.sizeInfo.width,
          height: this.sizeInfo.height,
        });

        // Fetch the SVG and extract path data
        const svgResponse = await fetch(this.cutMarksPath);
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
              color: this.cutMarksColor, // Set color for visibility
            });
            //console.log(`Path ${index + 1} drawn successfully.`);
          } catch (error) {
            console.error(`Error drawing path ${index + 1}:`, error);
          }
        });

        await this.createPreview(key);
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const file = new File([blob], "Labels.pdf", {
      type: "application/pdf",
    });

    // const url = URL.createObjectURL(blob);
    // const link = document.createElement("a");
    // link.href = url;
    // link.download = "masked-content-with-svg-overlay.pdf";
    // link.click();
    // URL.revokeObjectURL(url);

    // Show marks again
    this.designMarksLayer.show();
    this.switchLabel(this.currentLabel);

    this.dialog.open(DesignPreviewPopupComponent, {
      data: {
        type: this.data.vinylSize as artworkType,
        labelAPreview: this.previewImageLabelA,
        labelBPreview: this.previewImageLabelB,
        labelCPreview: this.previewImageLabelC,
        labelDPreview: this.previewImageLabelD,
        sleevePreview: "",
        pictureDiscPreview: "",
        slipmatPreview: "",
        labelsPDF: file,
      },
    });
  }

  async createPreview(object: string) {
    // Convert the stage to a Data URL (JPG format)
    const dataURL = this.stage.toDataURL({
      mimeType: "image/png",
      quality: 0.9,
      pixelRatio: 1.5, // Quality of image
    });

    // Store the Data URL in a variable
    if (object == "A") {
      this.previewImageLabelA = dataURL;
    } else if (object == "B") {
      this.previewImageLabelB = dataURL;
    } else if (object == "C") {
      this.previewImageLabelC = dataURL;
    } else if (object == "D") {
      this.previewImageLabelD = dataURL;
    } else if (object == "sleeve") {
      this.previewSleeve = dataURL;
    }
  }

  // Save Sleeve
  async saveSleevePDF() {
    // Hide Marks Layer
    this.designMarksLayer.hide();

    const highQualityPixelRatio = 3;

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
    const svgResponse = await fetch(this.cutMarksPath);
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
          color: this.cutMarksColor, // Set color for visibility
        });
        console.log(`Path ${index + 1} drawn successfully.`);
      } catch (error) {
        console.error(`Error drawing path ${index + 1}:`, error);
      }
    });

    await this.createPreview("sleeve");

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const file = new File([blob], "Sleeve.pdf", {
      type: "application/pdf",
    });

    // Show marks again
    this.designMarksLayer.show();

    this.dialog.open(DesignPreviewPopupComponent, {
      data: {
        type: this.data.vinylSize as artworkType,
        sleevePreview: this.previewSleeve,
        pdfFile: file,
      },
    });
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
    if (
      this.selectedObject instanceof Konva.Shape &&
      !(input.id == "colorPickerBackground")
    ) {
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

  // // Hide layer options when clicking outside
  // @HostListener("document:click", ["$event"])
  // onDocumentClick(event: MouseEvent) {
  //   const target = event.target as HTMLElement;
  //   if (
  //     this.optionsDiv &&
  //     !this.optionsDiv.nativeElement.contains(target) &&
  //     this.layerPositionButton &&
  //     !this.layerPositionButton.nativeElement.contains(target)
  //   ) {
  //     //console.log("Clicked outside of the toggle");
  //     this.showLayerPosition = false;
  //   }
  //
  //   if (
  //     this.shapesSelectDiv &&
  //     !this.shapesSelectDiv.nativeElement.contains(target) &&
  //     this.shapesToggleButton &&
  //     !this.shapesToggleButton.nativeElement.contains(target)
  //   ) {
  //     this.showShapesSelect = false;
  //   }
  //
  //   if (
  //     this.duplicateLabelsSelectDiv &&
  //     !this.duplicateLabelsSelectDiv.nativeElement.contains(target) &&
  //     this.duplicateLabelsToggleButton &&
  //     !this.duplicateLabelsToggleButton.nativeElement.contains(target)
  //   ) {
  //     this.showLabelsDuplicateSelect = false;
  //   }
  //
  //   if (
  //     this.fontSelectButton &&
  //     !this.fontSelectButton.nativeElement.contains(target)
  //   ) {
  //     //console.log("Clicked outside of the toggle");
  //     this.showFontSelect = false;
  //   }
  // }

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
    // this.transformer
    //   .nodes([textNode])
    //   .enabledAnchors(["middle-left", "middle-right"]);
    this.selectObject(textNode);
    this.transformer.show();
    this.maskedGroup.add(textNode);

    // Set available tools
    this.setAvailableTools("text");
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
      this.setAvailableTools("text");
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
      this.setAvailableTools("text");
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
      // Get new font size
      const scaleX = textNode.scaleX();
      const newFontSize = Math.round(textNode.fontSize() * scaleX * 10) / 10; // Round to 1 decimal place
      // Update font size and reset scale
      textNode.fontSize(newFontSize);
      textNode.scaleX(1); // Reset scale to avoid double scaling
      textNode.scaleY(1);

      // Update the form control to reflect the new font size
      this.fontSizeControl.setValue(newFontSize, { emitEvent: false });

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
    // const lineHeight = textNode.fontSize() * scale.x; // Get both X and Y scales
    // let originalText = textNode.text();

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
    scale.x = 1;
    scale.y = 1;
    const lineHeight = textNode.fontSize() * scale.x; // Calculate scaled line

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

    let textHeight = (textNode.height() - 20) / lines.length;
    this.caret.points([
      textNode.x() + alignmentOffset + textWidth,
      textNode.y() +
        textHeight * this.caretPosition.lineIndex +
        textNode.padding(),
      textNode.x() + alignmentOffset + textWidth,
      textNode.y() +
        textHeight * this.caretPosition.lineIndex +
        textHeight +
        textNode.padding(),
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

  //////////////////// END OF TEXT ////////////
  clearStage() {
    this.endEditing;
    this.transformer.hide();
    this.selectedObject = this.maskedPath;
    this.setAvailableTools("stage");
    this.maskedGroup.destroyChildren();
    this.maskedPath.fill("#dcdcdc");
    this.layer.draw();
    if (this.caret) {
      this.caret.destroy();
    }
  }

  // Delete object
  deleteObject() {
    if (this.selectedObject !== this.maskedPath) {
      this.selectedObject?.destroy();
      this.transformer.hide();
      this.selectedObject = this.maskedPath;
      this.setAvailableTools("stage");
      if (this.caret) {
        this.caret.destroy();
        clearInterval(this.caretInterval);
      }
    }
  }

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

      if (duplicate instanceof Konva.Text) {
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
  setAvailableTools(type: string) {
    for (const tool of this.designerTools) {
      const toolButton = document.getElementById(
        tool.triggerButtonId,
      ) as HTMLElement;
      if (toolButton && tool.toolType != type && tool.toolType != "all") {
        toolButton.classList.add("unclickable-button");
      } else if (type == "stage") {
        toolButton.classList.add("unclickable-button");
      } else {
        toolButton.classList.remove("unclickable-button");
      }
      // Always show duplicate label option
      if (toolButton && tool.toolType == "alwaysOn") {
        toolButton.classList.remove("unclickable-button");
      }
      // Show color picker
      if (
        toolButton &&
        (type == "shape" || type == "text") &&
        tool.toolType == "color"
      ) {
        toolButton.classList.remove("unclickable-button");
      }
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

      this.addTextNodeEvents(textNode);

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

  //<editor-fold desc="All designer action buttons logic">

  openEditorOptions(event: MouseEvent, elementID: string, action: string) {
    const targetButton = event.target as HTMLButtonElement;
    const targetDiv = document.getElementById(elementID) as HTMLDivElement;

    let bul = false;
    for (const tool of this.designerTools) {
      // First hide all the tools
      tool.displayBool = false;
      const toolElement = document.getElementById(tool.divId) as HTMLDivElement;
      if (toolElement) {
        toolElement.style.display = "none";
      }

      // Show just the selected tool
      if (tool.divId == targetDiv.id) {
        tool.displayBool = !tool.displayBool;
        bul = tool.displayBool;
        console.log(this.designerTools);
        if (tool.displayBool) {
          targetDiv.style.display = "grid";
        } else {
          targetDiv.style.display = "none";
        }
      }
    }

    if (bul) {
      // Get the button's position
      targetDiv.style.left = targetButton.getBoundingClientRect().left + "px";
      targetDiv.style.top = targetButton.getBoundingClientRect().bottom + "px";

      // Sett up div for left side menu
      if (action == "add_shape") {
        targetDiv.style.left = targetButton.clientWidth + "px";
        targetDiv.style.top = targetButton.getBoundingClientRect().top + "px";
      }
    }
  }

  // Copy content from another label
  copyContentOfLabel(targetLabel: string) {
    const dialogRef = this.dialog.open(ConfirmActionPopupComponent, {
      data: {
        action_name: "copy label",
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result == true) {
        this.clearStage();
        await this.switchLabelFill(this.labelsJSON[targetLabel as LabelKeys]);
      }
    });
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
  }

  // Method to add different shapes
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

    this.setAvailableTools("shape");
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

  fontSize: number = 20; // Default font size
  // Adjust font size
  adjustFontSize(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    this.endEditing;
    this.isEditing = false;
    if (this.fontSize > 0) {
      if (this.selectedObject instanceof Konva.Text) {
        this.selectedObject.fontSize(this.fontSize);
        this.updateCaretPosition();
        this.layer.batchDraw(); // Re-draw layer to apply changes
      }
    }
  }

  //</editor-fold>

  ///////// END MUSIC FILES ///////////////////

  openConfirmActionPopup(action: string) {
    const dialogRef = this.dialog.open(ConfirmActionPopupComponent, {
      data: {
        action_name: action,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (action == "clear stage" && result == true) {
        this.clearStage();
      }
    });
  }
}

type LabelKeys = "A" | "B" | "C" | "D";

export interface TwlDesigner {
  type: string;
  vinylSize: string;
  doubleAlbum: boolean;
}

export interface DesignTool {
  divId: string;
  triggerButtonId: string;
  displayBool: boolean;
  toolType: string;
}
