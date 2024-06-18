import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProgressIndicatorService {
  private progressSource = new BehaviorSubject<boolean>(false);
  isOn: Observable<boolean> = this.progressSource.asObservable();

  private valueSource = new BehaviorSubject<number>(0);
  percentDone: Observable<number> = this.valueSource.asObservable();

  show() {
    this.progressSource.next(true);
  }

  hide() {
    this.progressSource.next(false);
  }

  changeValue(percent: number) {
    this.valueSource.next(percent);
  }
}
