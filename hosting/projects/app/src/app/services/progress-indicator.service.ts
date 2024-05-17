import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProgressIndicatorService {
  private progressSource = new BehaviorSubject<boolean>(false);

  isOn: Observable<boolean> = this.progressSource.asObservable();

  show() {
    return this.progressSource.next(true);
  }

  hide() {
    return this.progressSource.next(false);
  }
}
