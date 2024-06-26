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

  await getFirestore()
    .collection("shopOrders")
    .doc(user.uid)
    .set(shopOrder, { merge: true });
}

woocommerceRouter.post("/webhook", async (req: Request, res: Response) => {
  const topic = res.locals.topic as string;

  switch (topic) {
    case "order.created":
    case "order.updated":
    case "order.restored":
      await onOrderCreate(req);
      break;
    case "order.deleted":
      // await orderDeleted((req.body.id as number).toString());
      break;
  }

  res.status(200).json({});
});
