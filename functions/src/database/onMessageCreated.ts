import { DataSnapshot } from "firebase-admin/database";
import { DatabaseEvent, onValueCreated } from "firebase-functions/v2/database";
import { logInfo } from "../services";
import { Message } from "../../../shared-interfaces";

export const dbmessageoncreated = onValueCreated(
  {
    ref: "/messages/{id}",
  },
  onMessageCreated,
);

async function onMessageCreated(
  event: DatabaseEvent<DataSnapshot, { id: string }>,
) {
  const id = event.params.id;
  const data = event.data.val() as Message;

  logInfo(`ℹ️ [db] onMessageCreated for id=${id}`, {
    data: data,
  });
}
