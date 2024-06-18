import { Injectable } from "@angular/core";
import { QueryConstraint } from "@angular/fire/firestore";
import { FirestoreBaseService } from "./api-base/firestore-base.service";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { ShopOrder, ShopOrderJSON } from "../interfaces/shopOrder";

@Injectable({
  providedIn: "root",
})
export class FirestoreApiService extends FirestoreBaseService {
  constructor(private _progress: ProgressIndicatorService) {
    super(_progress);
  }

  public async getShopOrder(
    userId: string,
  ): Promise<ShopOrderJSON | undefined> {
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
