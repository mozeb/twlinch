import {
  onDocumentCreated,
  type FirestoreEvent,
  type QueryDocumentSnapshot,
} from "firebase-functions/v2/firestore";
import { logInfo } from "../services";
import { User } from "../../../shared-interfaces";

export const fsusersoncreated = onDocumentCreated(
  {
    document: "/users/{id}",
  },
  onUserCreated,
);

async function onUserCreated(
  event: FirestoreEvent<QueryDocumentSnapshot | undefined, { id: string }>,
) {
  const id = event.params.id;
  const data = event.data?.data() as User;

  logInfo(`ℹ️ [fs] onUserCreated for id=${id}`, {
    data: data,
  });
}
