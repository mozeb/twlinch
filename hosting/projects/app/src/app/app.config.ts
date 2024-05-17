import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { environment } from "../environments/environment";
import { getApp, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import {
  connectDatabaseEmulator,
  getDatabase,
  provideDatabase,
} from "@angular/fire/database";
import {
  initializeAuth,
  provideAuth,
  browserLocalPersistence,
  connectAuthEmulator,
} from "@angular/fire/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  provideFirestore,
} from "@angular/fire/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  provideFunctions,
} from "@angular/fire/functions";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { provideAnimations } from "@angular/platform-browser/animations";

const useEmulators = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = initializeAuth(getApp(), {
        persistence: browserLocalPersistence,
      });
      if (useEmulators && location.hostname === "localhost") {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideDatabase(() => {
      const database = getDatabase();
      if (useEmulators && location.hostname === "localhost") {
        connectDatabaseEmulator(database, "127.0.0.1", 9000);
      }
      return database;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (useEmulators && location.hostname === "localhost") {
        connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (useEmulators && location.hostname === "localhost") {
        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      }
      return functions;
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline", floatLabel: "always" },
    },
  ],
};
