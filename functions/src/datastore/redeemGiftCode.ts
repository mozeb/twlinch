import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { logError, logLog } from "../services";
import { DateTime } from "luxon";
import { ShopOrderJSON } from "../interfaces";
import { getFirestore } from "firebase-admin/firestore";
import { OrderAddOns, OrderProcess } from "../https/woocommerce";
import { GiftCode } from "../interfaces/giftCode";

export const callredeemgift = onCall<
  RedeemGiftReq,
  Promise<ApiCallBase<never>>
>(
  {
    memory: "512MiB",
  },
  async (req: CallableRequest) => {
    return await redeemGift(req.data);
  },
);

// Creat new user if gift redeemed
async function redeemGift(data: RedeemGiftReq): Promise<ApiCallBase<never>> {
  let user: UserRecord;
  let proceed: string = "notExists";

  // Get gift card data
  const redeemCard = await getFirestore()
    .collection("giftVouchers")
    .doc(data.pass)
    .get();
  const giftCard = redeemCard.data() as GiftCode;

  // Check if gift card exists
  if (redeemCard) {
    logLog(`Is used? [${giftCard.is_used}].`);
    // If trying to redeem and code was not redeemed - create user
    if (giftCard.is_used == false) {
      proceed = "createUser";
    }
    // If trying to redeem with mail that is in database - log user in
    if (giftCard.is_used == true && giftCard.redeemer_email == data.email) {
      proceed = "logIn";
      return {
        status: "success",
        timeNow: DateTime.utc().toISO() as string,
      };
    }
    // If trying to redeem with mail that is in database - log user in
    if (giftCard.is_used == true && giftCard.redeemer_email !== data.email) {
      return {
        error: {
          message: "This code was already redeemed with another email.",
        },
        status: "error",
        timeNow: DateTime.utc().toISO() as string,
      };
    }
  }
  if (proceed == "createUser") {
    try {
      // Create auth user
      user = await getAuth().createUser({
        email: data.email,
        password: data.pass,
        emailVerified: true,
      });
      logLog(`✅ Created new user [${user.uid}].`);

      // Redeem the card
      giftCard.is_used = true;
      giftCard.redeemer_email = data.email;
      await getFirestore()
        .collection("giftVouchers")
        .doc(data.pass)
        .set(giftCard, { merge: true });

      // Create shop order in database
      const giftOrder = createShopOrder(giftCard);
      giftOrder.auth_uid = user.uid;
      await getFirestore()
        .collection("shopOrders")
        .doc(user.uid)
        .set(giftOrder, { merge: true });
      // Errors
    } catch (e: any) {
      if (e?.code === "auth/email-already-exists") {
        // User exists
        logLog(`ℹ️ User with ${data.email} exists.`);
        user = await getAuth().getUserByEmail(data.email);
        if (!user.emailVerified) {
          await getAuth().updateUser(user.uid, { emailVerified: true });
        }
        logLog(`✅ Got user ${user.uid} and set verified email.`);
      } else {
        logError(`Auth error ${e?.code}`, { e });
        throw e;
      }
    }

    return {
      status: "success",
      timeNow: DateTime.utc().toISO() as string,
    };
  }
  return {
    status: "error",
    timeNow: DateTime.utc().toISO() as string,
  };
}

function createShopOrder(gc: GiftCode): ShopOrderJSON {
  const item_lines_12_Inch = [
    {
      wc_id: 587,
      name: "Custom Vinyl Record",
      wc_product_id: 618,
      wc_variation_id: 0,
      quantity: 1,
      sku: "twlcstrcd",
    },
    {
      wc_id: 612,
      name: "12 Inch (Up to 20 minutes per side)",
      wc_product_id: 619,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 613,
      name: "Black Vinyl",
      wc_product_id: 656,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 614,
      name: "Custom Label",
      wc_product_id: 3973,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 549,
      name: "Custom Printed Sleeve",
      wc_product_id: 3975,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
  ];

  const item_lines_10_Inch = [
    {
      wc_id: 587,
      name: "Custom Vinyl Record",
      wc_product_id: 618,
      wc_variation_id: 0,
      quantity: 1,
      sku: "twlcstrcd",
    },
    {
      wc_id: 620,
      name: "10 Inch (Up to 14 minutes per side)",
      wc_product_id: 620,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 613,
      name: "Black Vinyl",
      wc_product_id: 656,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 3972,
      name: "Custom Label",
      wc_product_id: 3972,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 541,
      name: "Custom Printed Sleeve",
      wc_product_id: 3974,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
  ];

  const item_lines_7_Inch = [
    {
      wc_id: 587,
      name: "Custom Vinyl Record",
      wc_product_id: 618,
      wc_variation_id: 0,
      quantity: 1,
      sku: "twlcstrcd",
    },
    {
      wc_id: 621,
      name: "7 Inch (Up to 6 minutes per side)",
      wc_product_id: 621,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 613,
      name: "Black Vinyl",
      wc_product_id: 656,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 627,
      name: "Custom Label",
      wc_product_id: 627,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 659,
      name: "Custom Printed Sleeve",
      wc_product_id: 659,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
  ];

  const item_lines_12_picture_disc = [
    {
      wc_id: 4211,
      name: "Custom Picture Disc",
      wc_product_id: 4211,
      wc_variation_id: 0,
      quantity: 1,
      sku: "twlcstpcd",
    },
    {
      wc_id: 5052,
      name: "12 Inch Picture Disc",
      wc_product_id: 5052,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 3975,
      name: "Custom Printed Sleeve",
      wc_product_id: 3975,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
  ];

  const item_lines_7_picture_disc = [
    {
      wc_id: 4211,
      name: "Custom Picture Disc",
      wc_product_id: 4211,
      wc_variation_id: 0,
      quantity: 1,
      sku: "twlcstpcd",
    },
    {
      wc_id: 5049,
      name: "7 Inch Picture Disc",
      wc_product_id: 5049,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
    {
      wc_id: 659,
      name: "Custom Printed Sleeve",
      wc_product_id: 659,
      wc_variation_id: 0,
      quantity: 1,
      sku: "",
    },
  ];

  const _orderProcessVR: OrderProcess = {
    musicProcess: "waitingForUpload",
    sleeveProcess: "waitingForUpload",
    labelProcess: "waitingForUpload",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "notOrdered",
  };

  const _orderProcessPD: OrderProcess = {
    musicProcess: "waitingForUpload",
    sleeveProcess: "waitingForUpload",
    labelProcess: "notOrdered",
    slipmatProcess: "notOrdered",
    pictureDiscProcess: "waitingForUpload",
  };

  // Select the right size vinyl
  let line_items = item_lines_12_Inch;
  let op = _orderProcessVR;

  switch (gc.product) {
    case "12 Inch Custom Vinyl Record":
      line_items = item_lines_12_Inch;
      op = _orderProcessVR;
      break;
    case "10 Inch Custom Vinyl Record":
      line_items = item_lines_10_Inch;
      op = _orderProcessVR;
      break;
    case "7 Inch Custom Vinyl Record":
      line_items = item_lines_7_Inch;
      op = _orderProcessVR;
      break;
    case "12 Inch Custom Picture Disc":
      line_items = item_lines_12_picture_disc;
      op = _orderProcessPD;
      break;
    case "7 Inch Custom Picture Disc":
      line_items = item_lines_7_picture_disc;
      op = _orderProcessPD;
      break;
  }

  // Create order
  const giftOrder: ShopOrderJSON = {
    address_billing: {
      address_1: "",
      address_2: "",
      city: "",
      company: "",
      country: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      postcode: "",
      state: "",
    },
    address_shipping: {
      address_1: "",
      address_2: "",
      city: "",
      company: "",
      country: "",
      first_name: "",
      last_name: "",
      postcode: "",
      state: "",
    },
    customer_note: "",
    date_created: DateTime.now().toString(),
    item_lines: line_items,
    paid: true,
    wc_order_num: gc.code_id,
    wc_status: "processing",
    isGift: true,
  };

  const _orderAddOns: OrderAddOns = {
    sleeveAddOn: "notAdded",
    labelAddOn: "notAdded",
    slipmatAddOn: "notAdded",
    doubleAlbumAddOn: "notAdded",
    designServicesAddOn: "notAdded",
    onlineDesignerAddOn: "notAdded",
  };

  giftOrder.order_add_ons = _orderAddOns;
  giftOrder.order_process = op;

  return giftOrder;
}

// Interfaces
export interface RedeemGiftReq {
  email: string;
  pass: string;
}

export interface ApiCallBase<T> {
  status: "success" | "error";
  timeNow: string;
  data?: T;
  error?: ApiCallError;
}

export interface ApiCallError {
  message: string;
  err?: unknown;
  data?: unknown;
}
