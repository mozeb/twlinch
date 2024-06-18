import { Injectable } from "@angular/core";
import { QueryConstraint } from "@angular/fire/firestore";
import { DatastoreBaseService } from "./api-base/datastore-base.service";
import { ProgressIndicatorService } from "./progress-indicator.service";

@Injectable({
  providedIn: "root",
})
export class DatastoreApiService extends DatastoreBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
  }

  public async getShopOrder(userId: string): Promise<any> {
    return this.getDoc(`shopOrders/${userId}`);
  }

  // public async setUser(id: string, data: User): Promise<void> {
  //   return this.setDoc(`users/${id}`, data);
  // }
  //
  // public async addUser(data: User): Promise<void> {
  //   return this.addDoc("users", data);
  // }
  //
  // public async updateUser(id: string, data: Partial<User>): Promise<void> {
  //   return this.updateDoc(`users/${id}`, data);
  // }
  //
  // public async getUsers(): Promise<User[]> {
  //   return this.getCol("users");
  // }
  //
  // public async queryUsers(query: QueryConstraint[]): Promise<User[]> {
  //   return this.queryCol("users", query);
  // }
  //
  // public async cntUsers(query: QueryConstraint[] = []): Promise<number> {
  //   return this.countCol("users", query);
  // }
}
