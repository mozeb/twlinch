import { Injectable } from "@angular/core";
import { limitToLast, orderByKey } from "@angular/fire/database";
import { DatabaseBaseService } from "./api-base/database-base.service";
import { ProgressIndicatorService } from "./progress-indicator.service";

@Injectable({
  providedIn: "root",
})
export class DatabaseApiService extends DatabaseBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
  }
  // public getMessage(id: string): Promise<Message> {
  //   return this.getVal(`/messages/${id}`);
  // }
  //
  // public listMessages(): Promise<Message[]> {
  //   return this.getList("/messages", [orderByKey(), limitToLast(100)]);
  // }
  //
  // public setMessage(id: string, data: Message): Promise<void> {
  //   return this.setVal(`/messages/${id}`, data);
  // }
  //
  // public updateMessage(id: string, data: Partial<Message>): Promise<void> {
  //   return this.updateVal(`/messages/${id}`, data);
  // }
}
