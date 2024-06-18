import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProgressIndicatorService {
  private progressSource = new BehaviorSubject<boolean>(false);
  isOn: Observable<boolean> = this.progressSource.asObservable();

  private doneSource = new BehaviorSubject<number>(0);
  percentDone: Observable<number> = this.doneSource.asObservable();

  private bufferSource = new BehaviorSubject<number>(0);
  percentBuffer: Observable<number> = this.bufferSource.asObservable();

  show() {
    this.progressSource.next(true);
  }

  hide() {
    this.progressSource.next(false);
  }

  updateDonePercent(percent: number) {
    this.doneSource.next(percent);
  }

  updateBufferPercent(percent: number) {
    this.bufferSource.next(percent);
  }
}
