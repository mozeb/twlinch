import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

// Notify users about errors and other helpful stuff
export interface Msg {
  content: string;
  style: string;
}

@Injectable({
  providedIn: "root",
})
export class NotifyService {
  private msgSource = new Subject<Msg | null>();

  msg: Observable<Msg | null> = this.msgSource.asObservable();

  /**
   * Send new notification
   */
  update(content: string, style: "error" | "warn" | "info" | "success") {
    const msg: Msg = { content, style };
    return this.msgSource.next(msg);
  }
}
