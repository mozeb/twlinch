import {
  type Request,
  type Response,
  type NextFunction,
  Router,
} from "express";
import { has } from "lodash";
import { logLog } from "../../services";
import { getFirestore } from "firebase-admin/firestore";
import {
  ShopOrderJSON,
  shopOrderWCOrderConverter,
  WCOrderJSON,
} from "../../interfaces";
import { getAuth } from "firebase-admin/auth";
import { firestore } from "firebase-admin";
import { GiftCode, GiftVoucher } from "../../interfaces/giftCode";
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
  let isVinyl = false;
  const wcData = req.body as WCOrderJSON;
  const shopOrder = shopOrderWCOrderConverter.toJSON(wcData);

  shopOrder.item_lines.forEach((element) => {
    // Check if vinyl record was ordered
    switch (element.wc_product_id) {
      case 618: // vinyl record
        sendNewOrderEmail(
          shopOrder.address_billing.first_name,
          shopOrder.wc_order_num,
          shopOrder.address_billing.email,
        );
        isVinyl = true;
        break;
      case 4211: //picture disc
        sendNewOrderEmail(
          shopOrder.address_billing.first_name,
          shopOrder.wc_order_num,
          shopOrder.address_billing.email,
        );
        isVinyl = true;
        break;
      case 5934: //vinyl record gift
        createGiftVoucher(shopOrder);
        break;
      case 6119: // picture disc gift
        createGiftVoucher(shopOrder);
        break;
    }
  });

  logLog(`Is that vinyl order: ${isVinyl}`);

  if (isVinyl) {
    const user = await getAuth().createUser({
      email: shopOrder.wc_order_num + "." + shopOrder.address_billing.email,
      emailVerified: true,
      password: "00" + shopOrder.wc_order_num,
    });

    // Not Gift Card
    shopOrder.isGift = false;
    // Connect order with user
    shopOrder.auth_uid = user.uid;

    const _orderProcess: OrderProcess = {
      musicProcess: "waitingForUpload",
      sleeveProcess: "notOrdered",
      labelProcess: "notOrdered",
      slipmatProcess: "notOrdered",
      pictureDiscProcess: "notOrdered",
    };

    const _orderAddOns: OrderAddOns = {
      sleeveAddOn: "notAdded",
      labelAddOn: "notAdded",
      slipmatAddOn: "notAdded",
      doubleAlbumAddOn: "notAdded",
      designServicesAddOn: "notAdded",
      onlineDesignerAddOn: "notAdded",
    };

    const _twDesignStatus: twDesignStatus = "waitingUploads";
    const _twRecordingStatus: twRecordingStatus = "waitingUploads";

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

    shopOrder.order_add_ons = _orderAddOns;
    shopOrder.order_process = _orderProcess;
    shopOrder.tw_design_order_status = _twDesignStatus;
    shopOrder.tw_recording_order_status = _twRecordingStatus;

    await getFirestore()
      .collection("shopOrders")
      .doc(user.uid)
      .set(shopOrder, { merge: true });
  }
}

// Send auto email when new order created
function sendNewOrderEmail(
  customerName: string,
  orderNumber: string,
  orderEmail: string,
) {
  firestore()
    .collection("mail")
    .add({
      to: orderEmail,
      template: {
        name: "new_custom_vinyl_order",
        data: {
          customer_name: customerName,
          order_number: orderNumber,
          order_email: orderEmail,
        },
      },
    });
}

// Create  new gift voucher
async function createGiftVoucher(order: ShopOrderJSON) {
  // Create code
  const possible = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
  const lengthOfCode = 6;
  let productType = "";
  let pdfTemplate = "";
  const code = makeRandom(lengthOfCode, possible);

  order.item_lines.forEach((element) => {
    switch (element.wc_variation_id) {
      case 5935: // 12
        productType = "12 Inch Custom Vinyl Record";
        pdfTemplate =
          "twlinch-records.appspot.com/voucher-template/vinyl-voucher-template.zip";
        break;
      case 5936: // 10
        productType = "10 Inch Custom Vinyl Record";
        pdfTemplate =
          "twlinch-records.appspot.com/voucher-template/vinyl-voucher-template.zip";
        break;
      case 5937: // 7
        productType = "7 Inch Custom Vinyl Record";
        pdfTemplate =
          "twlinch-records.appspot.com/voucher-template/vinyl-voucher-template.zip";
        break;
      case 6120: // 12 PD
        productType = "12 Inch Custom Picture Disc";
        pdfTemplate =
          "twlinch-records.appspot.com/voucher-template/vinyl-voucher-template.zip";
        break;
      case 6122: // 7 PD
        productType = "7 Inch Custom Picture Disc";
        pdfTemplate =
          "twlinch-records.appspot.com/voucher-template/vinyl-voucher-template.zip";
        break;
    }
  });

  const codeObj: GiftCode = {
    code_id: code,
    date_created: order.date_created,
    date_used: "",
    is_used: false,
    product: productType,
    purchaser_email: order.address_billing.email,
    wc_order_id: order.wc_order_num,
    user_id: "",
    redeemer_email: "",
    voucherPDFLink:
      "https://storage.googleapis.com/twlinch-records-pdfs/" +
      "Twlinch_Gift_Card_" +
      order.wc_order_num +
      ".pdf",
  };

  const pdf: GiftVoucher = {
    code_id: code,
    product: productType,
    _pdfplum_config: {
      templatePath: pdfTemplate,
      outputFileName: "Twlinch_Gift_Card_" + order.wc_order_num + ".pdf",
    },
  };

  await getFirestore().collection("giftVouchers").doc(code).set(codeObj);
  await getFirestore().collection("createdPDFs").doc(code).set(pdf);

  sendVoucherEmail(
    order.address_billing.first_name,
    order.wc_order_num,
    order.address_billing.email,
    "custom_vinyl_gift",
    "https://storage.googleapis.com/twlinch-records-pdfs/" +
      "Twlinch_Gift_Card_" +
      order.wc_order_num +
      ".pdf",
  );
}

// Send gift voucher email
function sendVoucherEmail(
  customerName: string,
  orderNumber: string,
  orderEmail: string,
  voucherType: string,
  voucherLink: string,
) {
  firestore()
    .collection("mail")
    .add({
      to: orderEmail,
      template: {
        name: voucherType,
        data: {
          customer_name: customerName,
          order_number: orderNumber,
          order_email: orderEmail,
          voucher_link: voucherLink,
        },
      },
    });
}

// Create random voucher code
function makeRandom(lengthOfCode: number, possible: string) {
  let text = "";
  for (let i = 0; i < lengthOfCode; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// On update order in woocommerce
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

export type orderState = "notOrdered" | "waitingForUpload" | "uploadFinished";

export type twDesignStatus =
  | "waitingUploads"
  | "uploadsFinished"
  | "uploadsVerified"
  | "printing";

export type twRecordingStatus =
  | "waitingUploads"
  | "uploadsFinished"
  | "uploadsVerified"
  | "recorded";

export interface OrderProcess {
  musicProcess: orderState;
  sleeveProcess: orderState;
  labelProcess: orderState;
  slipmatProcess: orderState;
  pictureDiscProcess: orderState;
}

export type addOnState = "added" | "notAdded";

export interface OrderAddOns {
  doubleAlbumAddOn: addOnState;
  sleeveAddOn: addOnState;
  labelAddOn: addOnState;
  slipmatAddOn: addOnState;
  designServicesAddOn: addOnState;
  onlineDesignerAddOn: addOnState;
}
