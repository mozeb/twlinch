export interface OrderProcess {
  musicProcess: orderState;
  sleeveProcess: orderState;
  labelProcess: orderState;
  slipmatProcess: orderState;
  pictureDiscProcess: orderState;
}

export enum op {
  notOrdered,
  waitingForUpload,
  uploadFinished,
}

export type orderState = "notOrdered" | "waitingForUpload" | "uploadFinished";
