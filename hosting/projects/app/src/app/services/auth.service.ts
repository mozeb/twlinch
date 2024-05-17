import { inject, Injectable } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
  user,
  UserCredential,
} from "@angular/fire/auth";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth: Auth = inject(Auth);
  user$ = user(this.auth);

  /**
   * Get current user (if any) only once
   */
  get currentUser(): Promise<User | null> {
    return firstValueFrom(this.user$);
  }

  async emailSignUp(
    email: string,
    password: string,
    verifyEmail: boolean = false,
  ): Promise<void> {
    try {
      const userCred: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      if (verifyEmail) {
        console.log("auth: send verification email");
        await sendEmailVerification(userCred.user);
      }
    } catch (err) {
      throw err;
    }
  }

  async emailLogin(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (err) {
      throw err;
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
