import { runWith } from "firebase-functions";
import { UserRecord } from "firebase-admin/auth";
import { logInfo } from "../services";

export const auth_onUserCreated = runWith({
  memory: "256MB",
  timeoutSeconds: 30,
  maxInstances: 10,
})
  .auth.user()
  .onCreate(onUserCreated);

async function onUserCreated(user: UserRecord) {
  logInfo(`ℹ️ [auth] onUserCreated for uid=${user.uid}`, {
    email: user.email,
    uid: user.uid,
  });
}
