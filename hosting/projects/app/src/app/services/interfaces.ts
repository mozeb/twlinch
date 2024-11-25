export interface OrderProcess {
  musicProcess: orderState;
  sleeveProcess: orderState;
  labelProcess: orderState;
  slipmatProcess: orderState;
  pictureDiscProcess: orderState;
}

export type addOnState = "added" | "notAdded";

export interface OrderAddOns {
  doubleAlbumAddOn: addOnState;
  sleeveAddOn: addOnState;
  labelAddOn: addOnState;
  slipmatAddOn: addOnState;
  designServicesAddOn: addOnState;
  onlineDesignerAddOn: addOnState;
}

export enum op {
  notOrdered,
  waitingForUpload,
  uploadFinished,
}

export type orderState = "notOrdered" | "waitingForUpload" | "uploadFinished";

export type twDesignStatus =
  | "waitingUploads"
  | "uploadsFinished"
  | "uploadsVerified"
  | "printing";

export type twRecordingStatus =
  | "waitingUploads"
  | "uploadsFinished"
  | "uploadsVerified"
  | "recorded";

export const twDesignOrderStatusColor: { [key: string]: string } = {
  waitingUploads: "#ffd62c",
  uploadsFinished: "#f5eb2d",
  uploadsVerified: "#cdff90",
  printing: "#97ff90",
};

export const twRecordingOrderStatusText: { [key: string]: string } = {
  waitingUploads: "waiting uploads",
  uploadsFinished: "uploads finished",
  uploadsVerified: "uploads verified",
  recorded: "recorded",
};

export const twRecordingOrderStatusColor: { [key: string]: string } = {
  waitingUploads: "#ffd62c",
  uploadsFinished: "#f5eb2d",
  uploadsVerified: "#cdff90",
  recorded: "#97ff90",
};

export const twDesignOrderStatusText: { [key: string]: string } = {
  waitingUploads: "waiting uploads",
  uploadsFinished: "uploads finished",
  uploadsVerified: "uploads verified",
  printing: "printing",
  completed: "completed",
};

export const statusBackgroundColor: { [key: string]: string } = {
  waitingForUpload: "#fff0b3",
  notOrdered: "#d3d3d3",
  uploadFinished: "#90ff98",
};

export const orderProcessBackgroundColor: { [key: string]: string } = {
  processing: "#fff0b3",
  completed: "#90ff98",
  pending: "#fff0b3",
  on_hold: "#fff0b3",
  canceled: "#ff9090",
  refunded: "#ff9090",
  failed: "#ff9090",
  trash: "#ff9090",
};
/**
 * Chip text color
 */
export const statusTextColor = {
  completed: "#2e4453",
  failed: "#761919",
  refunded: "#777",
  cancelled: "#777",
  pending: "#777",
  processing: "#5b841b",
  "on-hold": "#94660c",
  trash: "#761919",
};
