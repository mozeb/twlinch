import {
  type Request,
  type Response,
  type NextFunction,
  Router,
} from "express";
import { has } from "lodash";
import { logLog } from "../../services";
import { getFirestore } from "firebase-admin/firestore";
import { shopOrderWCOrderConverter, WCOrderJSON } from "../../interfaces";
import { getAuth } from "firebase-admin/auth";
export const woocommerceRouter = Router();

woocommerceRouter.use((req: Request, res: Response, next: NextFunction) => {
  const topic = req.header("X-WC-Webhook-Topic");
  logLog(`[woocommerce-wh] Topic: ${topic}`);

  // Return proper response for pings
  if (topic === undefined && has(req.body, "webhook_id")) {
    return res.status(200).json({});
  }
  res.locals.topic = topic;
  return next();
});

async function onOrderCreate(req: Request) {
  const wcData = req.body as WCOrderJSON;
  const shopOrder = shopOrderWCOrderConverter.toJSON(wcData);

  const user = await getAuth().createUser({
    email: shopOrder.wc_order_num + "." + shopOrder.address_billing.email,
    emailVerified: true,
    password: "00" + shopOrder.wc_order_num,
  });

  shopOrder.auth_uid = user.uid;

  const _orderProcess: OrderProcess = {
    musicProcess: "waitingForUpload",
    sleeveProcess: "notOrdered",
    labelProcess: "notOrdered",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "notOrdered",
  };

  // Search which element were purchased and have to be uploaded
  shopOrder.item_lines.forEach((element) => {
    if (
      element.wc_product_id == 659 ||
      element.wc_product_id == 3974 ||
      element.wc_product_id == 3975
    ) {
      _orderProcess.sleeveProcess = "waitingForUpload";
    }
    if (element.wc_product_id == 691) {
      _orderProcess.slipmatProcess = "waitingForUpload";
    }
    if (
      element.wc_product_id == 3972 ||
      element.wc_product_id == 3973 ||
      element.wc_product_id == 627
    ) {
      _orderProcess.labelProcess = "waitingForUpload";
    }
    if (element.wc_product_id == 4211) {
      _orderProcess.pictureDiscProcess = "waitingForUpload";
    }
  });

  shopOrder.order_process = _orderProcess;

  await getFirestore()
    .collection("shopOrders")
    .doc(user.uid)
    .set(shopOrder, { merge: true });
}

async function onOrderUpdate(req: Request) {
  const wcData = req.body as WCOrderJSON;
  const shopOrder = shopOrderWCOrderConverter.toJSON(wcData);

  const user = await getAuth().getUserByEmail(
    shopOrder.wc_order_num + "." + shopOrder.address_billing.email,
  );
  shopOrder.auth_uid = user.uid;

  await getFirestore()
    .collection("shopOrders")
    .doc(user.uid)
    .set(shopOrder, { merge: true });
}

woocommerceRouter.post("/webhook", async (req: Request, res: Response) => {
  const topic = res.locals.topic as string;

  switch (topic) {
    case "order.created":
      await onOrderCreate(req);
      break;
    case "order.restored":
    case "order.updated":
      await onOrderUpdate(req);
      break;
    case "order.deleted":
      // await orderDeleted((req.body.id as number).toString());
      break;
  }

  res.status(200).json({});
});

export interface OrderProcess {
  musicProcess: orderState;
  sleeveProcess: orderState;
  labelProcess: orderState;
  slipmatProcess: orderState;
  pictureDiscProcess: orderState;
}

export type orderState = "notOrdered" | "waitingForUpload" | "uploadFinished";
