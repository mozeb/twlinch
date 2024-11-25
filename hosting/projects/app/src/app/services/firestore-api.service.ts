import { Injectable } from "@angular/core";
import { QueryConstraint, where } from "@angular/fire/firestore";
import { FirestoreBaseService } from "./api-base/firestore-base.service";
import { ProgressIndicatorService } from "./progress-indicator.service";
import { ShopOrder, ShopOrderJSON } from "../interfaces/shopOrder";
import { AuthService } from "./auth.service";
import { forEach } from "lodash";

@Injectable({
  providedIn: "root",
})
export class FirestoreApiService extends FirestoreBaseService {
  constructor(
    private _progress: ProgressIndicatorService,
    private _authService: AuthService,
  ) {
    super(_progress);
  }

  public async getShopOrder(): Promise<ShopOrderJSON | undefined> {
    const user = await this._authService.currentUser;
    return await this.getDoc(`shopOrders/${user?.uid as string}`);
  }

  public async getShopOrderAdmin(
    userId: string,
  ): Promise<ShopOrderJSON | undefined> {
    return await this.getDoc(`shopOrders/${userId}`);
  }
  public async getAllOrders(): Promise<ShopOrderJSON[] | undefined> {
    return await this.getCol(`shopOrders`);
  }

  public async getProcessingOrders(): Promise<ShopOrderJSON[] | undefined> {
    return await this.queryCol(`shopOrders`, [
      where("wc_status", "==", "processing"),
    ]);
  }

  public async getShippedOrders(): Promise<ShopOrderJSON[] | undefined> {
    return await this.queryCol(`shopOrders`, [
      where("wc_status", "==", "completed"),
    ]);
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
