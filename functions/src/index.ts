import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();

setGlobalOptions({
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 30,
});

// Functions
// export * from "./callable";
// export * from "./auth";
// export * from "./database";
// export * from "./datastore";
export * from "./https";
export * from "./services";
