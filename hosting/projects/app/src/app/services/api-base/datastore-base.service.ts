import { inject, Injectable } from "@angular/core";
import {
  Firestore,
  doc,
  docData,
  updateDoc,
  setDoc,
  collection,
  collectionData,
  query,
  QueryConstraint,
  addDoc,
  getCountFromServer,
} from "@angular/fire/firestore";
import { firstValueFrom } from "rxjs";
import { ProgressIndicatorService } from "../progress-indicator.service";

@Injectable({
  providedIn: "root",
})
export class DatastoreBaseService {
  protected firestore: Firestore = inject(Firestore);

  constructor(private _baseProgress: ProgressIndicatorService) {}

  /**
   * Get a document on path.
   * @param path
   */
  public async getDoc<T>(path: string): Promise<T | undefined> {
    this._baseProgress.show();

    const ref = doc(this.firestore, path);
    const snap = await firstValueFrom(docData(ref));

    this._baseProgress.hide();
    return snap as T | undefined;
  }

  /**
   * Create a document on path.
   * @param path
   * @param data
   */
  public async setDoc<T>(path: string, data: T): Promise<void> {
    this._baseProgress.show();

    const ref = doc(this.firestore, path);
    await setDoc(ref, data as any);

    this._baseProgress.hide();
  }

  /**
   * Update a document from path.
   * @param path
   * @param data
   */
  public async updateDoc<T>(path: string, data: Partial<T>): Promise<void> {
    this._baseProgress.show();

    const ref = doc(this.firestore, path);
    await updateDoc(ref, data as any);

    this._baseProgress.hide();
  }

  /**
   * Add a document to collection.
   * @param path Path to collection
   * @param data
   */
  public async addDoc<T>(path: string, data: T): Promise<void> {
    this._baseProgress.show();

    const ref = collection(this.firestore, path);
    await addDoc(ref, data as any);

    this._baseProgress.hide();
  }

  /**
   * Get collection of documents.
   * @param path
   */
  public async getCol<T>(path: string): Promise<T[]> {
    this._baseProgress.show();

    const ref = collection(this.firestore, path);
    const snap = await firstValueFrom(collectionData(ref));

    this._baseProgress.hide();
    return snap as T[];
  }

  /**
   * Query collection
   * @param path
   * @param queryConstraints
   */
  public async queryCol<T>(
    path: string,
    queryConstraints: QueryConstraint[],
  ): Promise<T[]> {
    this._baseProgress.show();

    const ref = query(collection(this.firestore, path), ...queryConstraints);
    const jsonValues = await firstValueFrom(collectionData(ref));

    this._baseProgress.hide();
    return jsonValues as T[];
  }

  /**
   * Count items in collection
   * @param path
   * @param queryConstraints
   */
  public async countCol(
    path: string,
    queryConstraints: QueryConstraint[],
  ): Promise<number> {
    this._baseProgress.show();

    const ref = query(collection(this.firestore, path), ...queryConstraints);
    const res = await getCountFromServer(ref);

    this._baseProgress.hide();
    return res.data().count;
  }
}
