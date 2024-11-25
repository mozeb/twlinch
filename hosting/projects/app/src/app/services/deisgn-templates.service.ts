import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import Konva from "konva";

@Injectable({
  providedIn: "root",
})
export class DeisgnTemplatesService {
  // Template objects for each size
  twelveInchTemplate: designTemplate = {
    type: "twelve",
    maskPath: "M1807.07,0v912.76h-908.59v-9.92H-.01V9.92h898.5V0h908.59Z",
    designMarksSvg: "./assets/12_Inch_Record/12_Inch_Design_Marks.svg",
    cutMarksSvg: "./assets/12_Inch_Record/12_Inch_Cut_Indicators.svg",
  };

  tenInchTemplate: designTemplate = {
    type: "ten",
    maskPath: "M1807.07,0v912.76h-908.59v-9.92H-.01V9.92h898.5V0h908.59Z",
    designMarksSvg: "./assets/12_Inch_Record/12_Inch_Design_Marks.svg",
    cutMarksSvg: "./assets/12_Inch_Record/12_Inch_Cut_Indicators.svg",
  };

  sevenInchTemplate: designTemplate = {
    type: "seven",
    maskPath: "M1807.07,0v912.76h-908.59v-9.92H-.01V9.92h898.5V0h908.59Z",
    designMarksSvg: "./assets/12_Inch_Record/12_Inch_Design_Marks.svg",
    cutMarksSvg: "./assets/12_Inch_Record/12_Inch_Cut_Indicators.svg",
  };

  constructor() {}

  // Calculate width and height of path data (SVG)
  async getWidthAndHeightOfPath(
    type: templateType,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      var pathData = "";
      if (type === "twelve") {
        pathData = this.twelveInchTemplate.maskPath;
      } else if (type === "ten") {
        pathData = this.tenInchTemplate.maskPath;
      } else if (type === "seven") {
        pathData = this.sevenInchTemplate.maskPath;
      }
      // Parse path data into commands
      const commands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g);
      if (!commands) {
        resolve({ width: 0, height: 0 });
        return;
      }

      // Initialize variables to track the bounding box
      let currentX = 0;
      let currentY = 0;
      let startX = 0;
      let startY = 0;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      // Process each command in the path
      commands.forEach((command) => {
        const type = command[0];
        const coords = command
          .slice(1)
          .trim()
          .split(/[\s,]+/)
          .map(Number);

        switch (type) {
          case "M": // Move to absolute position
            currentX = coords[0];
            currentY = coords[1];
            startX = currentX;
            startY = currentY;
            break;
          case "L": // Line to absolute position
            currentX = coords[0];
            currentY = coords[1];
            break;
          case "H": // Horizontal line to absolute x
            currentX = coords[0];
            break;
          case "V": // Vertical line to absolute y
            currentY = coords[0];
            break;
          case "h": // Horizontal line relative
            currentX += coords[0];
            break;
          case "v": // Vertical line relative
            currentY += coords[0];
            break;
          case "Z": // Close path, return to start
            currentX = startX;
            currentY = startY;
            break;
        }

        // Update bounding box
        minX = Math.min(minX, currentX);
        maxX = Math.max(maxX, currentX);
        minY = Math.min(minY, currentY);
        maxY = Math.max(maxY, currentY);
      });

      const width = maxX - minX;
      const height = maxY - minY;
      resolve({ width, height });
    });
  }

  // Svg path to points connverter
  parseSvgPathToPoints(pathData: string): { x: number; y: number }[] {
    const commands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g);
    if (!commands) return [];

    let currentX = 1807.07; // Initialize based on M command's absolute move
    let currentY = 0; // Initialize based on M command's absolute move
    const points: { x: number; y: number }[] = [{ x: currentX, y: currentY }];

    commands.forEach((command) => {
      const type = command[0];
      const coords = command
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      switch (type) {
        case "M": // Absolute move to starting position
          currentX = coords[0];
          currentY = coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        case "v": // Vertical line relative
          currentY += coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case "h": // Horizontal line relative
          currentX += coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case "V": // Vertical line absolute
          currentY = coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case "H": // Horizontal line absolute
          currentX = coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case "Z": // Close path
          // Ensure it closes the shape
          if (
            points.length &&
            (points[0].x !== currentX || points[0].y !== currentY)
          ) {
            points.push(points[0]); // Add the starting point to close the path
          }
          break;
      }
    });

    // Filter out any duplicate points
    const uniquePoints = points.filter((point, index, arr) => {
      return (
        index === 0 ||
        point.x !== arr[index - 1].x ||
        point.y !== arr[index - 1].y
      );
    });

    return uniquePoints.slice(0, 8); // Ensure exactly 8 points
  }

  // Get the points to draw mask
  async getFixedPolygonPoints(
    stageWidth: number,
    stageHeight: number,
    originalWidth: number,
    originalHeight: number,
    pathData: string,
  ): Promise<{
    points: { x: number; y: number }[];
    originalWidth: number;
    originalHeight: number;
  }> {
    const rawPoints = this.parseSvgPathToPoints(pathData);

    // Calculate scaling factors
    const scaleX = stageWidth / originalWidth;
    const scaleY = stageHeight / originalHeight;

    // Scale the points to fit the stage dimensions
    const scaledPoints = rawPoints.map((point) => ({
      x: point.x * scaleX,
      y: point.y * scaleY,
    }));

    return { points: scaledPoints, originalWidth, originalHeight };
  }

  // Method to load the SVG overlay as an image
  // Method to load the SVG overlay as an image and return a Konva.Image
  loadDesignMarksOverlay(
    stageWidth: number,
    stageHeight: number,
    type: templateType,
  ): Promise<Konva.Image> {
    var svgUrl = "";
    if (type === "twelve") {
      svgUrl = this.twelveInchTemplate.designMarksSvg;
    } else if (type === "ten") {
      svgUrl = this.tenInchTemplate.designMarksSvg;
    } else if (type === "seven") {
      svgUrl = this.sevenInchTemplate.designMarksSvg;
    }

    return fetch(svgUrl)
      .then((response) => response.text())
      .then((svgText) => {
        // Create a blob from the SVG text to load it as an image
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        return new Promise<Konva.Image>((resolve) => {
          const imageObj = new Image();
          imageObj.src = url;

          // Once the image is loaded, create a Konva.Image
          imageObj.onload = () => {
            const svgImage = new Konva.Image({
              image: imageObj,
              x: 0,
              y: 0,
              width: stageWidth,
              height: stageHeight,
            });

            // Clean up the blob URL after loading
            URL.revokeObjectURL(url);

            resolve(svgImage);
          };
        });
      });
  }
}

export interface designTemplate {
  type: templateType;
  maskPath: string;
  designMarksSvg: string;
  cutMarksSvg: string;
}

export type templateType = "twelve" | "ten" | "seven";
