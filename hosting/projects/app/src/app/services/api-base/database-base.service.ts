import { inject, Injectable } from "@angular/core";
import {
  Database,
  listVal,
  objectVal,
  query,
  QueryConstraint,
  ref,
  set,
  update,
} from "@angular/fire/database";
import { firstValueFrom } from "rxjs";
import { ProgressIndicatorService } from "../progress-indicator.service";

@Injectable({
  providedIn: "root",
})
export class DatabaseBaseService {
  protected rtdb: Database = inject(Database);

  constructor(private _baseProgress: ProgressIndicatorService) {}

  /**
   * Get data from DB once.
   * @param path
   */
  public async getVal<T>(path: string): Promise<T> {
    this._baseProgress.show();

    const dbRef = ref(this.rtdb, path);
    const json = await firstValueFrom(objectVal<T>(dbRef));

    this._baseProgress.hide();
    return json;
  }

  /**
   * Get data from DB as list.
   * @param path
   * @param queryConstraints
   */
  public async getList<T>(
    path: string,
    queryConstraints: QueryConstraint[],
  ): Promise<T[]> {
    this._baseProgress.show();

    const dbRef = query(ref(this.rtdb, path), ...queryConstraints);
    const values = await firstValueFrom(listVal<T>(dbRef));

    this._baseProgress.hide();
    return values;
  }

  /**
   * Set data to DB.
   * @param path
   * @param value
   */
  public async setVal<T>(path: string, value: T): Promise<void> {
    this._baseProgress.show();

    const dbRef = ref(this.rtdb, path);
    await set(dbRef, value);

    this._baseProgress.hide();
  }

  /**
   * Update data to DB.
   * @param path
   * @param value
   */
  public async updateVal<T>(path: string, value: Partial<T>): Promise<void> {
    this._baseProgress.show();

    const dbRef = ref(this.rtdb, path);
    await update(dbRef, value);

    this._baseProgress.hide();
  }
}
