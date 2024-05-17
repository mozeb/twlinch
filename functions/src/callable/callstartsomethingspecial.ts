import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { logInfo } from "../services";
import {
  StartSomethingSpecialReq,
  StartSomethingSpecialRes,
} from "../../../shared-interfaces";

export const callstartsomethingspecial = onCall(
  async (req: CallableRequest) => {
    return await startSomethingSpecial(req.data);
  },
);

async function startSomethingSpecial(
  data: StartSomethingSpecialReq,
): Promise<StartSomethingSpecialRes> {
  logInfo("ℹ️ [fun] startSomethingSpecial", {
    data: data,
  });

  return {
    items: [3, 2, 1, 0],
  };
}
